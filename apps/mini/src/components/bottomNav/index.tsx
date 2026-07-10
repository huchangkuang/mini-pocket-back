import React, { FC, memo } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import cs from "classnames";
import "./index.scss";

// 导入 tabbar 图标 SVG（cover-view 不支持 SVG 组件，需要用 Image/cover-image）
import homeIcon from "@/images/tabbar/home.svg";
import homeActiveIcon from "@/images/tabbar/home-active.svg";
import heartIcon from "@/images/tabbar/heart.svg";
import heartActiveIcon from "@/images/tabbar/heart-active.svg";
import userIcon from "@/images/tabbar/user.svg";
import userActiveIcon from "@/images/tabbar/user-active.svg";

export type TabKey = "workshop" | "favorites" | "mine";

export const TAB_ROUTES: Record<TabKey, string> = {
  workshop: "/pages/classify/index",
  favorites: "/pages/favorites/index",
  mine: "/pages/mine/index",
};

const TAB_ICONS: Record<string, { default: string; active: string }> = {
  home: { default: homeIcon, active: homeActiveIcon },
  heart: { default: heartIcon, active: heartActiveIcon },
  user: { default: userIcon, active: userActiveIcon },
};

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "workshop", label: "工作坊", icon: "home" },
  { key: "favorites", label: "收藏", icon: "heart" },
  { key: "mine", label: "我的", icon: "user" },
];

export type BottomNavProps = {
  active: TabKey;
  onSwitch?: (key: TabKey) => void;
};

const BottomNav: FC<BottomNavProps> = memo(({ active, onSwitch }) => {
  const switchTab = (key: TabKey) => {
    if (key === active) return;
    if (onSwitch) {
      onSwitch(key);
      return;
    }
    Taro.switchTab({ url: TAB_ROUTES[key] });
  };

  return (
    <View className="bottomNav">
      <View className="bottomNav__inner">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const iconSrc = isActive
            ? TAB_ICONS[tab.icon]?.active
            : TAB_ICONS[tab.icon]?.default;
          return (
            <View
              key={tab.key}
              className={cs("bottomNav__item", isActive && "bottomNav__item--active")}
              onClick={() => switchTab(tab.key)}
            >
              <Image
                src={iconSrc}
                style={{ width: "44rpx", height: "44rpx" }}
                mode="aspectFit"
              />
              <Text className={cs("bottomNav__label", isActive && "bottomNav__label--active")}>
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

export default BottomNav;
