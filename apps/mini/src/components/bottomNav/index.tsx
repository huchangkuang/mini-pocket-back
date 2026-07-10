import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import cs from "classnames";
import { AtIcon } from "taro-ui";
import "./index.scss";

export type TabKey = "workshop" | "favorites" | "mine";

export const TAB_ROUTES: Record<TabKey, string> = {
  workshop: "/pages/classify/index",
  favorites: "/pages/favorites/index",
  mine: "/pages/mine/index",
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
          return (
            <View
              key={tab.key}
              className={cs(
                "bottomNav__item",
                isActive && "bottomNav__item--active"
              )}
              onClick={() => switchTab(tab.key)}
            >
              <AtIcon
                value={tab.icon}
                size="22"
                color={isActive ? "#005ea4" : "#404752"}
              />
              <Text
                className={cs(
                  "bottomNav__label",
                  isActive && "bottomNav__label--active"
                )}
              >
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
