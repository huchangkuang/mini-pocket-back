import { useCallback, useEffect, useState } from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro, { useDidShow, useLoad, useShareAppMessage } from "@tarojs/taro";
import { useAuth } from "@/hooks/useAuth";
import {
  createMahjongSession,
  joinMahjongByScene,
  joinMahjongSession,
  listMahjongSessions,
} from "@/services/mahjongApi";
import type { ApiMahjongSessionList } from "@/types/api";
import { ApiError } from "@/utils/request";
import { errorToast } from "@/utils/errorToast";
import "./index.scss";

function formatScore(n: number) {
  if (n > 0) return `+${n.toLocaleString()}`;
  return n.toLocaleString();
}

export default function MahjongScoreIndex() {
  const { isReady, isLoggedIn, login } = useAuth();
  const [list, setList] = useState<ApiMahjongSessionList | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingScene, setPendingScene] = useState<string | null>(null);

  useLoad((options) => {
    const sid = options?.sessionId?.trim();
    const scene = options?.scene?.trim() || options?.scene;
    // 小程序码扫码进入：scene 在 options.scene
    if (typeof options?.scene === "string" && options.scene && !sid) {
      setPendingScene(decodeURIComponent(options.scene));
    } else if (sid) {
      setPendingSessionId(sid);
    }
  });

  const ensureAuth = useCallback(async () => {
    if (!isReady) return false;
    if (isLoggedIn) return true;
    return login();
  }, [isReady, isLoggedIn, login]);

  const refreshList = useCallback(async () => {
    if (!(await ensureAuth())) return;
    setLoading(true);
    try {
      const data = await listMahjongSessions();
      setList(data);
    } catch (err) {
      errorToast(err instanceof ApiError ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [ensureAuth]);

  const enterRoom = useCallback((sessionId: string) => {
    Taro.navigateTo({ url: `/pages/mahjongScore/room/index?sessionId=${sessionId}` });
  }, []);

  const handleDeepLink = useCallback(async () => {
    if (!pendingSessionId && !pendingScene) return;
    if (!(await ensureAuth())) return;
    try {
      Taro.showLoading({ title: "加入中...", mask: true });
      const snap = pendingScene
        ? await joinMahjongByScene(pendingScene)
        : await joinMahjongSession(pendingSessionId!);
      setPendingScene(null);
      setPendingSessionId(null);
      Taro.hideLoading();
      enterRoom(snap.sessionId);
    } catch (err) {
      Taro.hideLoading();
      errorToast(err instanceof ApiError ? err.message : "加入失败");
      setPendingScene(null);
      setPendingSessionId(null);
    }
  }, [pendingSessionId, pendingScene, ensureAuth, enterRoom]);

  // isReady 异步就绪：useDidShow 可能早于登录完成，需用 effect 补拉
  useEffect(() => {
    if (!isReady) return;
    if (pendingSessionId || pendingScene) {
      void handleDeepLink();
      return;
    }
    void refreshList();
  }, [isReady, pendingSessionId, pendingScene, handleDeepLink, refreshList]);

  useDidShow(() => {
    if (!isReady) return;
    if (pendingSessionId || pendingScene) {
      void handleDeepLink();
      return;
    }
    void refreshList();
  });

  const onCreate = async () => {
    if (!(await ensureAuth())) return;
    try {
      Taro.showLoading({ title: "创建中...", mask: true });
      const snap = await createMahjongSession();
      Taro.hideLoading();
      enterRoom(snap.sessionId);
    } catch (err) {
      Taro.hideLoading();
      errorToast(err instanceof ApiError ? err.message : "创建失败");
    }
  };

  useShareAppMessage(() => ({
    title: "麻将计分 - 一起来记账",
    path: "/pages/mahjongScore/index",
  }));

  const items = list?.items ?? [];
  const stats = list?.stats;

  return (
    <View className="mjHub">
      <View className="mjHub__body">
        <Button className="mjHub__create" onClick={onCreate}>
          新建牌局
        </Button>

        <View className="mjHub__stats">
          <View className="mjHub__statCard">
            <Text className="mjHub__statLabel">总局数</Text>
            <Text className="mjHub__statValue">{stats?.totalSessions ?? (loading ? "…" : 0)}</Text>
          </View>
          <View className="mjHub__statCard">
            <Text className="mjHub__statLabel">最高得分</Text>
            <Text className="mjHub__statValue mjHub__statValue--primary">
              {stats ? formatScore(stats.highestScore) : loading ? "…" : "0"}
            </Text>
          </View>
        </View>

        <View className="mjHub__historyHead">
          <Text className="mjHub__historyTitle">历史牌局</Text>
        </View>

        {items.length === 0 && !loading ? (
          <View className="mjHub__empty">
            <Text className="mjHub__emptyText">还没有参与过的牌局</Text>
          </View>
        ) : (
          <View className="mjHub__list">
            {items.map((item) => (
              <View
                key={item.sessionId}
                className="mjHub__card"
                onClick={() => enterRoom(item.sessionId)}
              >
                <View className="mjHub__cardTop">
                  <View>
                    <Text className="mjHub__code">{item.code}</Text>
                    <Text className="mjHub__status">
                      {item.status === "active" ? "进行中" : "已结束"}
                    </Text>
                  </View>
                  <Text className="mjHub__date">
                    {(item.endedAt || item.createdAt).slice(0, 10).replace(/-/g, ".")}
                  </Text>
                </View>
                <View className="mjHub__seats">
                  {[0, 1, 2, 3].map((seat) => {
                    const p = item.participants.find((x) => x.seatIndex === seat);
                    const total = item.totals[seat];
                    const name = p?.nickname || `座位${seat + 1}`;
                    const initial = name.slice(0, 1);
                    const positive = total >= 0;
                    return (
                      <View key={seat} className="mjHub__seat">
                        <View
                          className={`mjHub__avatar ${positive ? "mjHub__avatar--win" : ""}`}
                        >
                          <Text>{initial}</Text>
                        </View>
                        <Text className="mjHub__seatName">{name}</Text>
                        <Text
                          className={`mjHub__seatScore ${
                            positive ? "mjHub__seatScore--pos" : "mjHub__seatScore--neg"
                          }`}
                        >
                          {formatScore(total)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
