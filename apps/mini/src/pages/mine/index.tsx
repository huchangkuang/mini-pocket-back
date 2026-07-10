import React, { useMemo } from "react";
import Taro from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import MineTopBar from "@/components/mineTopBar";
import ProfileHeaderGuest from "@/components/profileHeaderGuest";
import ProfileHeaderLoggedIn from "@/components/profileHeaderLoggedIn";
import StatsGrid from "@/components/statsGrid";
import MineMenuList from "@/components/mineMenuList";
import MineAuthActions from "@/components/mineAuthActions";
import LevelProgress from "@/components/levelProgress";
import { errorToast } from "@/utils/errorToast";
import { useTabBarSelected } from "@/utils/useTabBarSelected";
import { useAuth } from "@/hooks/useAuth";
import { updateUserAvatar, updateUserNickname } from "@/utils/profileSync";
import {
  guestStats,
  loggedInStats,
  mineMenuItems,
  guestLevelProgress,
} from "@/pages/mine/constants";
import { DEFAULT_USER_LEVEL, mapLevelToProgressData } from "@/utils/levelMapper";
import "./index.scss";

const PLACEHOLDER_MSG = "更多功能正在开发中...";

const Mine: React.FC = () => {
  useTabBarSelected("mine");
  const { user, isLoggedIn, isReady, loggingIn, login, logout, refreshProfile } = useAuth();

  const stats = useMemo(() => {
    if (!isLoggedIn || !user) {
      return guestStats;
    }
    return loggedInStats.map((item) => {
      if (item.label === "已用工具") {
        return { ...item, value: String(user.stats.usedToolsCount) };
      }
      if (item.label === "活跃天数") {
        return { ...item, value: String(user.stats.activeDaysCount) };
      }
      if (item.label === "收藏") {
        return { ...item, value: String(user.stats.favoriteCount) };
      }
      return item;
    });
  }, [isLoggedIn, user]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const handlePlaceholder = () => {
    errorToast(PLACEHOLDER_MSG);
  };

  const goFeedback = async () => {
    if (!isLoggedIn) {
      const { confirm } = await Taro.showModal({
        title: "需要登录",
        content: "提交意见反馈需要先登录，是否立即登录？",
        confirmText: "登录",
      });
      if (!confirm) return;
      const ok = await login();
      if (!ok) return;
    }
    Taro.navigateTo({ url: "/pages/feedback/index" });
  };

  const handleMenuClick = (id: string) => {
    if (id === "feedback") {
      void goFeedback();
      return;
    }
    if (id === "about") {
      Taro.navigateTo({ url: "/pages/about/index" });
      return;
    }
    handlePlaceholder();
  };

  const handleAvatarChoose = async (tempPath: string) => {
    Taro.showLoading({ title: "上传中...", mask: true });
    try {
      await updateUserAvatar(tempPath);
      await refreshProfile();
      Taro.showToast({ title: "头像已更新", icon: "success", duration: 1500 });
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "头像更新失败");
    } finally {
      Taro.hideLoading();
    }
  };

  const [savingNickname, setSavingNickname] = React.useState(false);

  const handleNicknameSave = async (nickname: string) => {
    setSavingNickname(true);
    Taro.showLoading({ title: "保存中...", mask: true });
    try {
      await updateUserNickname(nickname);
      await refreshProfile();
      Taro.showToast({ title: "昵称已更新", icon: "success", duration: 1500 });
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "昵称更新失败");
      throw e;
    } finally {
      Taro.hideLoading();
      setSavingNickname(false);
    }
  };

  const levelProgress = useMemo(() => {
    if (!isLoggedIn || !user) return guestLevelProgress;
    return mapLevelToProgressData(user.level ?? DEFAULT_USER_LEVEL);
  }, [isLoggedIn, user]);

  const loggedInUser = user
    ? {
        nickname: user.nickname || "微信用户",
        joinDate: user.joinDate,
        badge: user.level?.title ?? DEFAULT_USER_LEVEL.title,
        avatarUrl: user.avatarUrl,
      }
    : null;

  return (
    <View className="minePage">
      <MineTopBar onNotification={handlePlaceholder} />

      <ScrollView scrollY enhanced className="minePage__scroll">
        <View className="minePage__content">
          {!isReady ? null : isLoggedIn && loggedInUser ? (
            <ProfileHeaderLoggedIn
              user={loggedInUser}
              savingNickname={savingNickname}
              onAvatarChoose={handleAvatarChoose}
              onNicknameSave={handleNicknameSave}
            />
          ) : (
            <ProfileHeaderGuest onLogin={handleLogin} />
          )}

          <StatsGrid items={stats} />

          <MineMenuList
            items={mineMenuItems}
            isLoggedIn={isLoggedIn}
            onItemClick={handleMenuClick}
          />

          {isReady ? (
            <MineAuthActions
              isLoggedIn={isLoggedIn}
              loggingIn={loggingIn}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          ) : null}

          <LevelProgress variant={isLoggedIn ? "loggedIn" : "guest"} data={levelProgress} />
        </View>
      </ScrollView>
    </View>
  );
};

export default Mine;
