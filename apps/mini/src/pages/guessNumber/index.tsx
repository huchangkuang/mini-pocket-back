import React, { useCallback, useEffect, useRef, useState } from "react";
import Taro, { useLoad, useShareAppMessage } from "@tarojs/taro";
import { View, Text, Input, Button } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import cs from "classnames";
import { useAuth } from "@/hooks/useAuth";
import { createGame, getGameInfo, submitGuess } from "@/services/gamesApi";
import { errorToast } from "@/utils/errorToast";
import type { ApiGameInfo, ApiGuessRecord } from "@/types/api";
import "./index.scss";

const parseResult = (result: string) => {
  const match = result.match(/^(\d)A(\d)B$/);
  return match ? { a: match[1], b: match[2] } : { a: "0", b: "0" };
};

const GUESSER_STATE = {
  CHECKING_AUTH: "checking_auth",
  LOADING_GAME: "loading_game",
  READY: "ready",
  WON: "won",
  NOT_FOUND: "not_found",
  ERROR: "error",
} as const;

type GuesserState = (typeof GUESSER_STATE)[keyof typeof GUESSER_STATE];

const GuessNumber: React.FC = () => {
  // ── Mode detection ──
  // gameIdFromUrl: undefined = 尚未确定（onLoad 未触发）, null = 确定无 gameId, string = 有 gameId
  const [gameIdFromUrl, setGameIdFromUrl] = useState<string | null | undefined>(
    undefined
  );
  const [modeOverride, setModeOverride] = useState<"creator" | null>(null);
  const isGuesserMode =
    gameIdFromUrl !== undefined &&
    Boolean(gameIdFromUrl) &&
    modeOverride !== "creator";
  const isCreatorMode =
    gameIdFromUrl !== undefined &&
    (!gameIdFromUrl || modeOverride === "creator");

  // 使用 useLoad 获取页面参数——这是 Taro 中最可靠的参数获取方式
  useLoad((options) => {
    const gid = options?.gameId?.trim();
    setGameIdFromUrl(gid || null);
  });

  const { isReady: isSessionReady, isLoggedIn, login } = useAuth();

  // ── Creator state ──
  const [targetNumber, setTargetNumber] = useState<string[]>(["", "", "", ""]);
  const [isTargetSet, setIsTargetSet] = useState(false);
  const [isTargetFocused, setIsTargetFocused] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  // Creator local game state (after target locked)
  const [creatorGuessNumber, setCreatorGuessNumber] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [creatorIsGuessFocused, setCreatorIsGuessFocused] = useState(false);
  const [creatorResults, setCreatorResults] = useState<
    Array<{ guess: string; result: string }>
  >([]);
  const [creatorAttempts, setCreatorAttempts] = useState(0);
  const [creatorGameOver, setCreatorGameOver] = useState(false);

  // ── Guesser state ──
  const [guesserState, setGuesserState] = useState<GuesserState>(
    GUESSER_STATE.READY
  );
  const [gameInfo, setGameInfo] = useState<ApiGameInfo | null>(null);
  const [guessNumber, setGuessNumber] = useState<string[]>(["", "", "", ""]);
  const [isGuessFocused, setIsGuessFocused] = useState(false);
  const [results, setResults] = useState<ApiGuessRecord[]>([]);
  const [submittingGuess, setSubmittingGuess] = useState(false);

  // ── Refs ──
  const targetInputRef = useRef<HTMLInputElement | null>(null);
  const guessInputRef = useRef<HTMLInputElement | null>(null);
  const creatorGuessInputRef = useRef<HTMLInputElement | null>(null);
  const shareGameIdRef = useRef<string | null>(null);
  const targetNumberRef = useRef<string[]>(["", "", "", ""]);
  const isTargetSetRef = useRef(false);

  // ── Guesser: detect gameId from URL and start auth flow ──
  useEffect(() => {
    if (
      gameIdFromUrl &&
      guesserState === GUESSER_STATE.READY &&
      modeOverride !== "creator"
    ) {
      setGuesserState(GUESSER_STATE.CHECKING_AUTH);
    }
  }, [gameIdFromUrl, guesserState, modeOverride]);

  // ── Guesser: wait for session, then load game ──
  useEffect(() => {
    if (!gameIdFromUrl || guesserState !== GUESSER_STATE.CHECKING_AUTH) return;

    if (!isSessionReady) {
      return;
    }

    const loadGame = async () => {
      // Session 就绪但未登录（新用户 silent login 可能失败），重试登录
      if (!isLoggedIn) {
        const ok = await login();
        if (!ok) {
          setGuesserState(GUESSER_STATE.ERROR);
          errorToast("登录失败，请重试");
          return;
        }
      }

      setGuesserState(GUESSER_STATE.LOADING_GAME);

      try {
        const info = await getGameInfo(gameIdFromUrl!);
        // Creator opened own share → switch to creator view
        if (info.isCreator) {
          setModeOverride("creator");
          setTargetNumber(["", "", "", ""]);
          setIsTargetSet(false);
          setCreatedGameId(info.gameId);
          // Also reset local game state
          resetCreatorGame();
          return;
        }

        setGameInfo(info);
        setResults(info.myHistory ?? []);

        const alreadyWon = info.myHistory?.some((r) => r.result === "4A0B");
        if (alreadyWon) {
          setGuesserState(GUESSER_STATE.WON);
        } else {
          setGuesserState(GUESSER_STATE.READY);
        }
      } catch (err) {
        const statusCode = (err as any)?.statusCode;
        if (statusCode === 404) {
          setGuesserState(GUESSER_STATE.NOT_FOUND);
        } else {
          setGuesserState(GUESSER_STATE.ERROR);
          errorToast((err as any)?.message || "加载游戏失败");
        }
      }
    };

    loadGame();
  }, [
    gameIdFromUrl,
    guesserState,
    isSessionReady,
    isLoggedIn,
    login,
    modeOverride,
  ]);

  // ── Share ──
  useShareAppMessage(() => {
    // Guesser mode: re-share the game
    if (gameIdFromUrl) {
      return {
        title: "来猜我出的数字吧！",
        path: `/pages/guessNumber/index?gameId=${gameIdFromUrl}`,
      };
    }

    // Creator mode: game already created
    if (shareGameIdRef.current) {
      return {
        title: "来猜我出的数字吧！",
        path: `/pages/guessNumber/index?gameId=${shareGameIdRef.current}`,
      };
    }

    // Creator mode: game not yet created, create it on share
    if (isTargetSetRef.current) {
      const targetStr = targetNumberRef.current.join("");
      // Returning a Promise — share panel waits while game is created
      return createGame(targetStr)
        .then((result) => {
          shareGameIdRef.current = result.gameId;
          setCreatedGameId(result.gameId);
          Taro.showToast({
            title: "游戏已创建，邀请好友来猜吧",
            icon: "success",
          });
          return {
            title: "来猜我出的数字吧！",
            path: `/pages/guessNumber/index?gameId=${result.gameId}`,
          };
        })
        .catch(() => {
          Taro.showToast({ title: "创建游戏失败，请重试", icon: "none" });
          return {
            title: "猜数字游戏",
            path: "/pages/guessNumber/index",
          };
        });
    }

    // Fallback: target not locked yet
    return {
      title: "猜数字游戏",
      path: "/pages/guessNumber/index",
    };
  });

  // Keep share ref in sync
  useEffect(() => {
    shareGameIdRef.current = createdGameId;
  }, [createdGameId]);

  // Keep target refs in sync for useShareAppMessage
  useEffect(() => {
    targetNumberRef.current = targetNumber;
  }, [targetNumber]);
  useEffect(() => {
    isTargetSetRef.current = isTargetSet;
  }, [isTargetSet]);

  // ── Shared handlers ──
  const handleTargetChange = (e: any) => {
    const value = e.detail.value;
    if (!/^\d{0,4}$/.test(value)) return;
    const newTarget = Array(4).fill("");
    for (let i = 0; i < value.length; i++) {
      newTarget[i] = value[i];
    }
    setTargetNumber(newTarget);
  };

  const handleCreatorGuessChange = (e: any) => {
    const value = e.detail.value;
    if (!/^\d{0,4}$/.test(value)) return;
    const newGuess = Array(4).fill("");
    for (let i = 0; i < value.length; i++) {
      newGuess[i] = value[i];
    }
    setCreatorGuessNumber(newGuess);
  };

  const handleGuesserGuessChange = (e: any) => {
    const value = e.detail.value;
    if (!/^\d{0,4}$/.test(value)) return;
    const newGuess = Array(4).fill("");
    for (let i = 0; i < value.length; i++) {
      newGuess[i] = value[i];
    }
    setGuessNumber(newGuess);
  };

  const focusTargetInput = () => {
    if (!isTargetSet && isCreatorMode) {
      targetInputRef.current?.focus();
    }
  };

  const focusCreatorGuessInput = () => {
    if (!creatorGameOver) {
      creatorGuessInputRef.current?.focus();
    }
  };

  const focusGuesserGuessInput = () => {
    if (isGuesserMode) {
      guessInputRef.current?.focus();
    }
  };

  // ── Local A/B calculation ──
  const calculateResult = useCallback((): string => {
    let a = 0;
    let b = 0;
    const targetCopy = [...targetNumber];
    const guessCopy = [...creatorGuessNumber];

    for (let i = 0; i < 4; i++) {
      if (targetCopy[i] === guessCopy[i]) {
        a++;
        targetCopy[i] = "";
        guessCopy[i] = "";
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== "") {
        const index = targetCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          b++;
          targetCopy[index] = "";
        }
      }
    }

    return `${a}A${b}B`;
  }, [targetNumber, creatorGuessNumber]);

  const resetCreatorGame = () => {
    setCreatorGuessNumber(["", "", "", ""]);
    setCreatorResults([]);
    setCreatorAttempts(0);
    setCreatorGameOver(false);
  };

  // ── Creator: lock target (local only) ──
  const handleLockTarget = () => {
    if (targetNumber.some((num) => num === "")) {
      Taro.showToast({ title: "请输入完整的四位数", icon: "none" });
      return;
    }
    setIsTargetSet(true);
    resetCreatorGame();
  };

  // ── Creator: local verify ──
  const handleCreatorVerify = () => {
    if (creatorGuessNumber.some((num) => num === "")) {
      Taro.showToast({ title: "请输入完整的四位数", icon: "none" });
      return;
    }

    const result = calculateResult();
    const newAttempts = creatorAttempts + 1;
    setCreatorAttempts(newAttempts);

    setCreatorResults([
      ...creatorResults,
      { guess: creatorGuessNumber.join(""), result },
    ]);
    setCreatorGuessNumber(["", "", "", ""]);

    if (result === "4A0B") {
      setCreatorGameOver(true);
      Taro.showModal({
        title: "恭喜猜对了！",
        content: `用了 ${newAttempts} 次`,
        confirmText: "重新开始",
        showCancel: false,
      }).then((res) => {
        if (res.confirm) {
          resetCreatorGame();
        }
      });
    }
  };

  // ── Guesser: submit guess ──
  const handleVerifyGuess = async () => {
    if (guessNumber.some((num) => num === "")) {
      Taro.showToast({ title: "请输入完整的四位数", icon: "none" });
      return;
    }

    if (submittingGuess || !gameIdFromUrl) return;

    setSubmittingGuess(true);

    try {
      const result = await submitGuess(gameIdFromUrl, guessNumber.join(""));
      setResults(result.history);
      setGuessNumber(["", "", "", ""]);

      if (result.won) {
        setGuesserState(GUESSER_STATE.WON);
        Taro.showModal({
          title: "恭喜猜对了！",
          content: `你用了 ${result.attemptNumber} 次猜中数字`,
          confirmText: "知道了",
          showCancel: false,
        });
      }
    } catch (err) {
      const statusCode = err?.statusCode;
      if (statusCode === 403) {
        Taro.showToast({ title: "不能猜自己出的题", icon: "none" });
      } else if (statusCode === 400) {
        Taro.showToast({
          title: err?.message || "你已经猜对了！",
          icon: "none",
        });
        if (gameIdFromUrl) {
          try {
            const info = await getGameInfo(gameIdFromUrl);
            setResults(info.myHistory ?? []);
            const alreadyWon = info.myHistory?.some((r) => r.result === "4A0B");
            if (alreadyWon) {
              setGuesserState(GUESSER_STATE.WON);
            }
          } catch {
            // ignore refresh errors
          }
        }
      } else {
        errorToast(err?.message || "提交失败，请重试");
      }
    } finally {
      setSubmittingGuess(false);
    }
  };

  // ── Render: digit grid (shared) ──
  const renderDigitCells = useCallback(
    (
      digits: string[],
      options: {
        locked?: boolean;
        focused: boolean;
        onFocusGrid: () => void;
      }
    ) => {
      const inputLength = digits.join("").length;

      return (
        <View className="guessNumber__inputGrid" onClick={options.onFocusGrid}>
          {digits.map((num, index) => {
            const isFocused =
              options.focused && !options.locked && index === inputLength;

            return (
              <View
                key={index}
                className={cs("guessNumber__digit", {
                  "guessNumber__digit--focused": isFocused,
                  "guessNumber__digit--filled": !!num && !options.locked,
                  "guessNumber__digit--locked": options.locked,
                })}
              >
                {options.locked ? "*" : num || ""}
                {isFocused && <View className="guessNumber__cursor" />}
              </View>
            );
          })}
        </View>
      );
    },
    []
  );

  // ── Render: rules card (both modes) ──
  const renderRulesCard = () => (
    <View className="guessNumber__rules">
      <View className="guessNumber__rulesInner">
        <View className="guessNumber__rulesIcon">
          <AtIcon value="alert-circle" size="20" color="#005ea4" />
        </View>
        <View className="guessNumber__rulesBody">
          <Text className="guessNumber__rulesTitle">游戏规则</Text>
          <Text className="guessNumber__rulesLine">
            <Text className="guessNumber__rulesLabelA">A：</Text>
            位置和数字都正确
          </Text>
          <Text className="guessNumber__rulesLine">
            <Text className="guessNumber__rulesLabelB">B：</Text>
            数字正确但位置不正确
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Render: local history list (shared) ──
  const renderLocalHistory = (
    items: Array<{ guess: string; result: string }>,
    showEmptyState: boolean
  ) => (
    <View className="guessNumber__history">
      <Text className="guessNumber__sectionTitle">历史猜测</Text>

      <View className="guessNumber__historyList">
        {items.map((item, index) => {
          const { a, b } = parseResult(item.result);
          return (
            <View key={index} className="guessNumber__historyItem">
              <View className="guessNumber__historyLeft">
                <Text className="guessNumber__historyIndex">
                  #{String(index + 1).padStart(2, "0")}
                </Text>
                <Text className="guessNumber__historyGuess">{item.guess}</Text>
              </View>
              <View className="guessNumber__historyBadges">
                <Text className="guessNumber__badge guessNumber__badge--a">
                  {a}A
                </Text>
                <Text className="guessNumber__badge guessNumber__badge--b">
                  {b}B
                </Text>
              </View>
            </View>
          );
        })}

        {showEmptyState && items.length < 2 && (
          <View className="guessNumber__emptyState">
            <Text className="guessNumber__emptyStateText">
              继续猜测以查看更多历史
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // ── Render: creator mode ──
  const renderCreatorMode = () => (
    <>
      {/* Target section */}
      <View className="guessNumber__target">
        <View className="guessNumber__targetHeader">
          <Text className="guessNumber__sectionTitle">目标数字</Text>
          {isTargetSet && (
            <Text className="guessNumber__lockedBadge">已锁定</Text>
          )}
        </View>

        {renderDigitCells(targetNumber, {
          locked: isTargetSet,
          focused: isTargetFocused,
          onFocusGrid: focusTargetInput,
        })}

        <Input
          ref={targetInputRef}
          className="guessNumber__hiddenInput"
          value={targetNumber.join("")}
          onInput={handleTargetChange}
          onFocus={() => setIsTargetFocused(true)}
          onBlur={() => setIsTargetFocused(false)}
          disabled={isTargetSet}
          maxlength={4}
          type="number"
        />

        {!isTargetSet && (
          <Button
            className="guessNumber__primaryBtn"
            onClick={handleLockTarget}
          >
            锁定目标
          </Button>
        )}

        {/* Share button — shown after target is locked, directly opens share panel */}
        {isTargetSet && (
          <Button className="guessNumber__shareBtn" openType="share">
            <AtIcon value="share" size="20" color="#6750a4" />
            {createdGameId ? "邀请好友来猜" : "邀请好友来猜"}
          </Button>
        )}
      </View>

      {/* Local guess area — shown after target is locked */}
      {isTargetSet && !creatorGameOver && (
        <View className="guessNumber__guess">
          <Text className="guessNumber__sectionTitle">
            猜测数字（单机模式）
          </Text>

          {renderDigitCells(creatorGuessNumber, {
            focused: creatorIsGuessFocused,
            onFocusGrid: focusCreatorGuessInput,
          })}

          <Input
            ref={creatorGuessInputRef}
            className="guessNumber__hiddenInput"
            value={creatorGuessNumber.join("")}
            onInput={handleCreatorGuessChange}
            onFocus={() => setCreatorIsGuessFocused(true)}
            onBlur={() => setCreatorIsGuessFocused(false)}
            maxlength={4}
            type="number"
          />

          <Button
            className="guessNumber__primaryBtn"
            onClick={handleCreatorVerify}
          >
            <AtIcon value="check-circle" size="20" color="#ffffff" />
            验证
          </Button>
        </View>
      )}

      {/* Local guess history */}
      {isTargetSet && creatorResults.length > 0 && (
        <>{renderLocalHistory(creatorResults, true)}</>
      )}
    </>
  );

  // ── Render: guesser mode ──
  const renderGuesserMode = () => {
    if (guesserState === GUESSER_STATE.NOT_FOUND) {
      return (
        <View className="guessNumber__errorState">
          <AtIcon value="alert-circle" size="48" color="#ba1a1a" />
          <Text className="guessNumber__errorTitle">游戏不存在</Text>
          <Text className="guessNumber__errorHint">
            该游戏可能已被删除，请联系好友重新发起
          </Text>
        </View>
      );
    }

    if (guesserState === GUESSER_STATE.ERROR) {
      return (
        <View className="guessNumber__errorState">
          <AtIcon value="close-circle" size="48" color="#ba1a1a" />
          <Text className="guessNumber__errorTitle">加载失败</Text>
          <Text className="guessNumber__errorHint">网络异常，请稍后重试</Text>
          <Button
            className="guessNumber__primaryBtn"
            onClick={() => setGuesserState(GUESSER_STATE.CHECKING_AUTH)}
          >
            重试
          </Button>
        </View>
      );
    }

    if (guesserState === GUESSER_STATE.WON) {
      return (
        <View className="guessNumber__wonState">
          <View className="guessNumber__wonIcon">
            <AtIcon value="check-circle" size="48" color="#4caf50" />
          </View>
          <Text className="guessNumber__wonTitle">你已经猜对了！</Text>
          {results.length > 0 && (
            <Text className="guessNumber__wonSubtitle">
              用了 {results.length} 次猜中数字
            </Text>
          )}
          <View className="guessNumber__wonHistory">
            {results.map((item, index) => {
              const { a, b } = parseResult(item.result);
              return (
                <View key={index} className="guessNumber__historyItem">
                  <View className="guessNumber__historyLeft">
                    <Text className="guessNumber__historyIndex">
                      #{String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text className="guessNumber__historyGuess">
                      {item.guess}
                    </Text>
                  </View>
                  <View className="guessNumber__historyBadges">
                    <Text className="guessNumber__badge guessNumber__badge--a">
                      {a}A
                    </Text>
                    <Text className="guessNumber__badge guessNumber__badge--b">
                      {b}B
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    // GUESSER_STATE.READY
    return (
      <View className="guessNumber__guess">
        {gameInfo && (
          <View className="guessNumber__creatorInfo">
            <Text className="guessNumber__creatorText">
              {gameInfo.creator.nickname
                ? `${gameInfo.creator.nickname} 邀请你猜一个四位数`
                : "好友邀请你猜一个四位数"}
            </Text>
          </View>
        )}

        <Text className="guessNumber__sectionTitle">猜测数字</Text>

        {renderDigitCells(guessNumber, {
          focused: isGuessFocused,
          onFocusGrid: focusGuesserGuessInput,
        })}

        <Input
          ref={guessInputRef}
          className="guessNumber__hiddenInput"
          value={guessNumber.join("")}
          onInput={handleGuesserGuessChange}
          onFocus={() => setIsGuessFocused(true)}
          onBlur={() => setIsGuessFocused(false)}
          maxlength={4}
          type="number"
        />

        <Button
          className="guessNumber__primaryBtn"
          onClick={handleVerifyGuess}
          disabled={submittingGuess || !gameInfo}
        >
          <AtIcon value="check-circle" size="20" color="#ffffff" />
          {submittingGuess ? "验证中..." : "验证"}
        </Button>

        <View className="guessNumber__history">
          <Text className="guessNumber__sectionTitle">历史猜测</Text>

          <View className="guessNumber__historyList">
            {results.map((item, index) => {
              const { a, b } = parseResult(item.result);
              return (
                <View key={index} className="guessNumber__historyItem">
                  <View className="guessNumber__historyLeft">
                    <Text className="guessNumber__historyIndex">
                      #{String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text className="guessNumber__historyGuess">
                      {item.guess}
                    </Text>
                  </View>
                  <View className="guessNumber__historyBadges">
                    <Text className="guessNumber__badge guessNumber__badge--a">
                      {a}A
                    </Text>
                    <Text className="guessNumber__badge guessNumber__badge--b">
                      {b}B
                    </Text>
                  </View>
                </View>
              );
            })}

            {results.length < 2 && (
              <View className="guessNumber__emptyState">
                <Text className="guessNumber__emptyStateText">
                  继续猜测以查看更多历史
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Params not yet determined (onLoad not fired) — show brief loading
  if (gameIdFromUrl === undefined) {
    return (
      <View className="guessNumber">
        <View className="guessNumber__content">
          {renderRulesCard()}
          <View className="guessNumber__loadingState">
            <AtIcon value="loading" size="24" color="#6750a4" />
            <Text className="guessNumber__loadingText">加载中...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="guessNumber">
      <View className="guessNumber__content">
        {renderRulesCard()}

        {isCreatorMode && renderCreatorMode()}
        {isGuesserMode && renderGuesserMode()}
      </View>
    </View>
  );
};

export default GuessNumber;
