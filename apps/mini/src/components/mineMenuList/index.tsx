import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import Icon from "@/components/Icon";
import { getIconComponent } from "@/utils/iconMap";
import type { MineMenuItem } from "@/pages/mine/constants";
import "./index.scss";

export type MineMenuListProps = {
  items: MineMenuItem[];
  isLoggedIn: boolean;
  onItemClick?: (id: string) => void;
};

const MineMenuList: FC<MineMenuListProps> = memo(({ items, isLoggedIn, onItemClick }) => {
  return (
    <View className="mineMenuList">
      {items.map((item, index) => (
        <View
          key={item.id}
          className={`mineMenuList__row${
            index < items.length - 1 ? " mineMenuList__row--border" : ""
          }`}
          onClick={() => onItemClick?.(item.id)}
        >
          <View className="mineMenuList__left">
            {React.createElement(getIconComponent(item.icon), {
              size: "20",
              color: isLoggedIn ? "#0077ce" : "#005ea4",
            })}
            <Text className="mineMenuList__label">
              {isLoggedIn ? item.labelLoggedIn : item.labelGuest}
            </Text>
          </View>
          <Icon name="arrow-right" size={18} color="#707783" />
        </View>
      ))}
    </View>
  );
});

export default MineMenuList;
