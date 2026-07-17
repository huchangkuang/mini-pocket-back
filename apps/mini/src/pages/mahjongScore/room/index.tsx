import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Button, Input, Image } from "@tarojs/components";
import Taro, { useDidShow, useLoad, useShareAppMessage } from "@tarojs/taro";
import Icon from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import avatarDemo from "@/images/mine/avatar-demo.svg";
import {
  endMahjongSession,
  getMahjongSnapshot,
  getMahjongWxacode,
  joinMahjongSession,
  saveMahjongDraft,
  updateMahjongRound,
} from "@/services/mahjongApi";
import type { ApiMahjongRound, ApiMahjongSessionSnapshot } from "@/types/api";
import { ApiError } from "@/utils/request";
import { errorToast } from "@/utils/errorToast";
import { updateUserAvatar, updateUserNickname } from "@/utils/profileSync";
import "./index.scss";

const POLL_MS = 2500;
/** 单席绝对分上限，与后端 MAHJONG_MAX_ABS_SCORE 保持一致 */
const MAX_ABS_SCORE = 99999;

function formatScore(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  if (n > 0) return `+${n}`;
  return String(n);
}

function seatLabel(snap: ApiMahjongSessionSnapshot, seat: number) {
  const p = snap.participants.find((x) => x.seatIndex === seat);
  return p?.nickname || `座位${seat + 1}`;
}

function isProfileIncomplete(user: {
  nickname?: string | null;
  avatarUrl?: string | null;
} | null): boolean {
  if (!user) return true;
  const nick = user.nickname?.trim() ?? "";
  const hasNick = nick.length > 0 && nick !== "微信用户";
  const hasAvatar = Boolean(user.avatarUrl?.trim());
  return !hasNick || !hasAvatar;
}

function parseScoreInput(raw: string): number | null {
  const t = raw.trim();
  if (t === "" || t === "-" || t === "+") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (Math.abs(n) > MAX_ABS_SCORE) return null;
  return n;
}

/** 输入过程中清洗：仅允许可选负号 + 数字，绝对值不超过上限 */
function sanitizeScoreTyping(raw: string): string {
  let v = raw.replace(/[^\d-]/g, "");
  if (v.includes("-")) {
    v = `-${v.replace(/-/g, "")}`;
  }
  if (v === "-" || v === "") return v;
  const digits = v.startsWith("-") ? v.slice(1) : v;
  if (digits.length === 0) return v;
  const n = Number(digits);
  if (!Number.isFinite(n)) return v.startsWith("-") ? "-" : "";
  const clamped = Math.min(n, MAX_ABS_SCORE);
  return v.startsWith("-") ? `-${clamped}` : String(clamped);
}

export default function MahjongRoomPage() {
  const { isReady, isLoggedIn, login, user, refreshProfile } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [snap, setSnap] = useState<ApiMahjongSessionSnapshot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<ApiMahjongRound | null>(null);
  const [inputs, setInputs] = useState<[string, string, string, string]>(["", "", "", ""]);
  const [wxacodeVisible, setWxacodeVisible] = useState(false);
  const [wxacodeSrc, setWxacodeSrc] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<"prompt" | "edit">("prompt");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const profilePromptDismissedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updatedAtRef = useRef<string | null>(null);

  useLoad((options) => {
    const sid = options?.sessionId?.trim();
    if (sid) setSessionId(sid);
  });

  const ensureAuth = useCallback(async () => {
    if (!isReady) return false;
    if (isLoggedIn) return true;
    return login();
  }, [isReady, isLoggedIn, login]);

  const applySnap = useCallback((next: ApiMahjongSessionSnapshot) => {
    updatedAtRef.current = next.updatedAt;
    setSnap(next);
  }, []);

  const loadSnapshot = useCallback(
    async (opts?: { quiet?: boolean }) => {
      if (!sessionId) return;
      if (!(await ensureAuth())) return;
      try {
        let next: ApiMahjongSessionSnapshot;
        try {
          next = await getMahjongSnapshot(sessionId);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 403) {
            next = await joinMahjongSession(sessionId);
          } else {
            throw err;
          }
        }
        if (!opts?.quiet || next.updatedAt !== updatedAtRef.current) {
          applySnap(next);
        }
      } catch (err) {
        if (!opts?.quiet) {
          errorToast(err instanceof ApiError ? err.message : "加载失败");
        }
      }
    },
    [sessionId, ensureAuth, applySnap],
  );

  useEffect(() => {
    if (!isReady || !sessionId) return;
    void loadSnapshot();
  }, [isReady, sessionId, loadSnapshot]);

  useDidShow(() => {
    if (!isReady || !sessionId) return;
    void loadSnapshot();
  });

  useEffect(() => {
    if (!sessionId || !snap || snap.status !== "active") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(() => {
      void loadSnapshot({ quiet: true });
    }, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, snap?.status, loadSnapshot]);

  // 进房后若缺头像/昵称，提示完善（可关闭，之后可点自己座位再改）
  useEffect(() => {
    if (!snap || !user || profilePromptDismissedRef.current || profileModalOpen) return;
    if (!isProfileIncomplete(user)) return;
    setNicknameDraft(user.nickname?.trim() || "");
    setProfileModalMode("prompt");
    setProfileModalOpen(true);
  }, [snap, user, profileModalOpen]);

  const closeProfileModal = () => {
    profilePromptDismissedRef.current = true;
    setProfileModalOpen(false);
  };

  const openProfileEditor = () => {
    setNicknameDraft(user?.nickname?.trim() || "");
    setProfileModalMode("edit");
    setProfileModalOpen(true);
  };

  const handleAvatarChoose = async (tempPath: string) => {
    Taro.showLoading({ title: "上传中...", mask: true });
    try {
      await updateUserAvatar(tempPath);
      await refreshProfile();
      await loadSnapshot({ quiet: true });
      Taro.showToast({ title: "头像已更新", icon: "success" });
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "头像更新失败");
    } finally {
      Taro.hideLoading();
    }
  };

  const handleNicknameSave = async () => {
    const trimmed = nicknameDraft.trim();
    if (!trimmed) {
      Taro.showToast({ title: "请输入昵称", icon: "none" });
      return;
    }
    if (trimmed === (user?.nickname?.trim() || "")) {
      return;
    }
    setSavingNickname(true);
    Taro.showLoading({ title: "保存中...", mask: true });
    try {
      await updateUserNickname(trimmed);
      await refreshProfile();
      await loadSnapshot({ quiet: true });
      Taro.showToast({ title: "昵称已更新", icon: "success" });
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "昵称更新失败");
    } finally {
      Taro.hideLoading();
      setSavingNickname(false);
    }
  };

  useShareAppMessage(() => {
    if (!sessionId || !snap) {
      return { title: "麻将计分", path: "/pages/mahjongScore/index" };
    }
    return {
      title: `麻将计分 ${snap.code}，一起来记账`,
      path: `/pages/mahjongScore/index?sessionId=${sessionId}`,
    };
  });

  const openDraftModal = () => {
    if (!snap || snap.status !== "active") return;
    const scores = snap.draft?.scores ?? [null, null, null, null];
    setEditingRound(null);
    setInputs([
      scores[0] === null ? "" : String(scores[0]),
      scores[1] === null ? "" : String(scores[1]),
      scores[2] === null ? "" : String(scores[2]),
      scores[3] === null ? "" : String(scores[3]),
    ]);
    setModalOpen(true);
  };

  const openEditRound = (round: ApiMahjongRound) => {
    if (!snap || snap.status !== "active") return;
    setEditingRound(round);
    setInputs([
      String(round.scores[0] ?? ""),
      String(round.scores[1] ?? ""),
      String(round.scores[2] ?? ""),
      String(round.scores[3] ?? ""),
    ]);
    setModalOpen(true);
  };

  const inputSum = useMemo(() => {
    const nums = inputs.map(parseScoreInput);
    if (nums.some((n) => n === null)) return null;
    return nums[0]! + nums[1]! + nums[2]! + nums[3]!;
  }, [inputs]);

  const validateScoreInputs = (): Array<number | null> | null => {
    if (inputs.some((raw) => {
      const t = raw.trim();
      if (t === "" || t === "-" || t === "+") return false;
      const n = Number(t);
      return !Number.isFinite(n) || !Number.isInteger(n) || Math.abs(n) > MAX_ABS_SCORE;
    })) {
      Taro.showToast({ title: `单席分数须在 ±${MAX_ABS_SCORE} 内`, icon: "none" });
      return null;
    }
    return inputs.map(parseScoreInput) as Array<number | null>;
  };

  const applySaveResult = (
    result: Awaited<ReturnType<typeof saveMahjongDraft>>,
    mode: "draft" | "confirm",
  ) => {
    applySnap(result.snapshot);
    setModalOpen(false);
    if (result.committed) {
      if (result.balanced === false) {
        Taro.showModal({
          title: "本轮已记录",
          content: "四席分数总和不为 0，可在历史中点开修改。",
          showCancel: false,
        });
      } else {
        Taro.showToast({ title: "已记入本轮", icon: "success" });
      }
      return;
    }
    Taro.showToast({
      title: mode === "draft" ? "草稿已保存" : "已保存",
      icon: "success",
    });
  };

  const onSaveDraft = async () => {
    if (!sessionId || !snap || editingRound) return;
    const scores = validateScoreInputs();
    if (!scores) return;
    if (scores.every((s) => s === null)) {
      Taro.showToast({ title: "请至少填写一个分数", icon: "none" });
      return;
    }
    try {
      Taro.showLoading({ title: "保存中...", mask: true });
      const result = await saveMahjongDraft(sessionId, scores);
      Taro.hideLoading();
      applySaveResult(result, "draft");
    } catch (err) {
      Taro.hideLoading();
      errorToast(err instanceof ApiError ? err.message : "保存失败");
    }
  };

  const onConfirmRound = async () => {
    if (!sessionId || !snap) return;
    const scores = validateScoreInputs();
    if (!scores) return;

    if (editingRound) {
      if (scores.some((s) => s === null)) {
        Taro.showToast({ title: "修改历史须填齐四人分数", icon: "none" });
        return;
      }
      const sum = scores[0]! + scores[1]! + scores[2]! + scores[3]!;
      if (sum !== 0) {
        Taro.showToast({ title: "四席总和必须为 0", icon: "none" });
        return;
      }
      try {
        Taro.showLoading({ title: "保存中...", mask: true });
        const next = await updateMahjongRound(sessionId, editingRound.id, scores as [
          number,
          number,
          number,
          number,
        ]);
        Taro.hideLoading();
        applySnap(next);
        setModalOpen(false);
        Taro.showToast({ title: "已更新", icon: "success" });
      } catch (err) {
        Taro.hideLoading();
        errorToast(err instanceof ApiError ? err.message : "保存失败");
      }
      return;
    }

    if (scores.some((s) => s === null)) {
      Taro.showToast({ title: "确认本轮须填齐四人分数", icon: "none" });
      return;
    }

    try {
      Taro.showLoading({ title: "保存中...", mask: true });
      // 四人齐全走现有草稿转正逻辑：提交后清空草稿并记入历史
      const result = await saveMahjongDraft(sessionId, scores);
      Taro.hideLoading();
      applySaveResult(result, "confirm");
    } catch (err) {
      Taro.hideLoading();
      errorToast(err instanceof ApiError ? err.message : "保存失败");
    }
  };

  const onEnd = () => {
    if (!sessionId || !snap || snap.status !== "active") return;
    Taro.showModal({
      title: "结束牌局",
      content: "结束后将丢弃未完成草稿，且不可再改分。确定结束？",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          Taro.showLoading({ title: "结束中...", mask: true });
          const next = await endMahjongSession(sessionId);
          Taro.hideLoading();
          applySnap(next);
          Taro.showToast({ title: "已结束", icon: "success" });
        } catch (err) {
          Taro.hideLoading();
          errorToast(err instanceof ApiError ? err.message : "操作失败");
        }
      },
    });
  };

  const onShowWxacode = async () => {
    if (!sessionId) return;
    try {
      Taro.showLoading({ title: "生成中...", mask: true });
      const data = await getMahjongWxacode(sessionId);
      Taro.hideLoading();
      const src = `data:image/png;base64,${data.imageBase64}`;
      setWxacodeSrc(src);
      setWxacodeVisible(true);
    } catch (err) {
      Taro.hideLoading();
      errorToast(err instanceof ApiError ? err.message : "生成小程序码失败");
    }
  };

  if (!snap) {
    return (
      <View className="mjRoom mjRoom--loading">
        <Text>加载中…</Text>
      </View>
    );
  }

  const draftMissing = snap.draft
    ? snap.draft.scores.filter((s) => s === null).length
    : 0;

  return (
    <View className="mjRoom">
      <View className="mjRoom__body">
        <View className="mjRoom__banner">
          <View>
            <Text className="mjRoom__bannerLabel">牌局编号</Text>
            <Text className="mjRoom__bannerCode">{snap.code}</Text>
          </View>
          <View className="mjRoom__bannerActions">
            <View className="mjRoom__iconBtn" onClick={onShowWxacode}>
              <Icon name="qr-code" size={20} color="#005ea4" />
            </View>
            <Button className="mjRoom__inviteBtn" openType="share">
              邀请
            </Button>
          </View>
        </View>

        <View className="mjRoom__grid">
          {[0, 1, 2, 3].map((seat) => {
            const p = snap.participants.find((x) => x.seatIndex === seat);
            const total = snap.totals[seat];
            const name = seatLabel(snap, seat);
            const isSelf = p != null && user?.id != null && p.userId === user.id;
            const avatarSrc = p
              ? (isSelf ? user?.avatarUrl || p.avatarUrl : p.avatarUrl) || avatarDemo
              : null;
            return (
              <View
                key={seat}
                className={`mjRoom__player ${isSelf ? "mjRoom__player--self" : ""}`}
                onClick={() => {
                  if (isSelf) openProfileEditor();
                }}
              >
                <View className="mjRoom__avatarOuter">
                  <View className="mjRoom__avatarWrap">
                    {avatarSrc ? (
                      <Image className="mjRoom__avatar" src={avatarSrc} mode="aspectFill" />
                    ) : (
                      <View className="mjRoom__avatar mjRoom__avatar--placeholder">
                        <Text>{name.slice(0, 1)}</Text>
                      </View>
                    )}
                  </View>
                  {isSelf ? <Text className="mjRoom__meBadge">我</Text> : null}
                </View>
                <Text className="mjRoom__name">{isSelf && user?.nickname ? user.nickname : name}</Text>
                <Text
                  className={`mjRoom__total ${
                    total >= 0 ? "mjRoom__total--pos" : "mjRoom__total--neg"
                  }`}
                >
                  {formatScore(total)}
                </Text>
              </View>
            );
          })}
        </View>

        {snap.draft ? (
          <View className="mjRoom__draftHint" onClick={openDraftModal}>
            <Text>
              本轮进行中 · 还差 {draftMissing} 席未填（点此继续）
            </Text>
          </View>
        ) : null}

        {snap.status === "active" ? (
          <Button className="mjRoom__addBtn" onClick={openDraftModal}>
            记录本轮分数
          </Button>
        ) : (
          <View className="mjRoom__endedBadge">
            <Text>牌局已结束（只读）</Text>
          </View>
        )}

        <View className="mjRoom__historyHead">
          <Text className="mjRoom__historyTitle">历史记录</Text>
        </View>

        <View className="mjRoom__rounds">
          {snap.rounds.length === 0 ? (
            <Text className="mjRoom__emptyRounds">暂无已完成轮次</Text>
          ) : (
            snap.rounds.map((round) => (
              <View
                key={round.id}
                className={`mjRoom__round ${
                  round.balanced === false ? "mjRoom__round--warn" : ""
                }`}
                onClick={() => openEditRound(round)}
              >
                <View>
                  <Text className="mjRoom__roundNo">第 {round.roundNo} 轮</Text>
                  <Text className="mjRoom__roundMeta">
                    {round.balanced === false ? "不平衡 · 可修改" : "已记录"}
                  </Text>
                </View>
                <View className="mjRoom__roundScores">
                  {round.scores.map((s, i) => (
                    <View key={i} className="mjRoom__roundScore">
                      <Text className="mjRoom__roundSeat">座{i + 1}</Text>
                      <Text
                        className={
                          (s ?? 0) >= 0 ? "mjRoom__total--pos" : "mjRoom__total--neg"
                        }
                      >
                        {formatScore(s)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        {snap.status === "active" ? (
          <Button className="mjRoom__endBtn" onClick={onEnd}>
            结束牌局
          </Button>
        ) : null}
      </View>

      {modalOpen ? (
        <View className="mjRoom__mask">
          <View className="mjRoom__modal">
            <View className="mjRoom__modalHead">
              <Text className="mjRoom__modalTitle">
                {editingRound ? `修改第 ${editingRound.roundNo} 轮` : "记录本轮"}
              </Text>
              <Text className="mjRoom__modalClose" onClick={() => setModalOpen(false)}>
                ✕
              </Text>
            </View>
            <View className="mjRoom__modalGrid">
              {[0, 1, 2, 3].map((seat) => (
                <View key={seat} className="mjRoom__modalField">
                  <Text className="mjRoom__modalName">{seatLabel(snap, seat)}</Text>
                  <Input
                    className="mjRoom__modalInput"
                    type="number"
                    placeholder="分数"
                    maxlength={6}
                    value={inputs[seat]}
                    onInput={(e) => {
                      const v = sanitizeScoreTyping(e.detail.value);
                      setInputs((prev) => {
                        const next = [...prev] as [string, string, string, string];
                        next[seat] = v;
                        return next;
                      });
                    }}
                  />
                </View>
              ))}
            </View>
            {inputSum !== null && inputSum !== 0 ? (
              <Text className="mjRoom__sumWarn">
                当前总和为 {inputSum}
                {editingRound ? "，修改历史必须为 0" : "（确认本轮可不强制为 0，之后可改）"}
              </Text>
            ) : null}
            {editingRound ? (
              <Button className="mjRoom__saveBtn" onClick={onConfirmRound}>
                确认修改
              </Button>
            ) : (
              <View className="mjRoom__modalActions">
                <Button className="mjRoom__draftBtn" onClick={onSaveDraft}>
                  保存草稿
                </Button>
                <Button className="mjRoom__saveBtn mjRoom__saveBtn--flex" onClick={onConfirmRound}>
                  确认本轮
                </Button>
              </View>
            )}
          </View>
        </View>
      ) : null}

      {wxacodeVisible && wxacodeSrc ? (
        <View className="mjRoom__mask" onClick={() => setWxacodeVisible(false)}>
          <View className="mjRoom__wxModal" onClick={(e) => e.stopPropagation()}>
            <Text className="mjRoom__modalTitle">扫码加入牌局</Text>
            <Image className="mjRoom__wxImg" src={wxacodeSrc} mode="aspectFit" />
            <Button className="mjRoom__saveBtn" onClick={() => setWxacodeVisible(false)}>
              关闭
            </Button>
          </View>
        </View>
      ) : null}

      {profileModalOpen ? (
        <View className="mjRoom__mask">
          <View className="mjRoom__profileModal" onClick={(e) => e.stopPropagation()}>
            <View className="mjRoom__modalHead">
              <Text className="mjRoom__modalTitle">
                {profileModalMode === "prompt" ? "完善资料" : "修改资料"}
              </Text>
              <Text className="mjRoom__modalClose" onClick={closeProfileModal}>
                ✕
              </Text>
            </View>
            {profileModalMode === "prompt" ? (
              <Text className="mjRoom__profileTip">
                为更好的计分体验，请先修改头像或昵称
              </Text>
            ) : (
              <Text className="mjRoom__profileTip">点击头像或下方昵称进行修改</Text>
            )}
            <Button
              className="mjRoom__profileAvatarBtn"
              openType="chooseAvatar"
              onChooseAvatar={(e) => {
                void handleAvatarChoose(e.detail.avatarUrl);
              }}
            >
              <Image
                className="mjRoom__profileAvatar"
                src={user?.avatarUrl || avatarDemo}
                mode="aspectFill"
              />
              <Text className="mjRoom__profileAvatarHint">点击更换头像</Text>
            </Button>
            <View className="mjRoom__profileNickRow">
              <Input
                className="mjRoom__profileNickInput"
                type="nickname"
                placeholder="请输入昵称"
                value={nicknameDraft}
                maxlength={32}
                disabled={savingNickname}
                onInput={(e) => setNicknameDraft(e.detail.value)}
                onBlur={handleNicknameSave}
                onConfirm={handleNicknameSave}
              />
              <Text
                className="mjRoom__profileNickSave"
                onClick={() => {
                  void handleNicknameSave();
                }}
              >
                保存
              </Text>
            </View>
            <Button className="mjRoom__saveBtn" onClick={closeProfileModal}>
              {profileModalMode === "prompt" ? "稍后再说" : "完成"}
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}
