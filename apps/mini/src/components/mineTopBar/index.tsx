import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { getMenuButtonBoundingClientRect } from "@tarojs/taro";
import Icon from "@/components/Icon";
import "./index.scss";

export type MineTopBarProps = {
  onNotification?: () => void;
};

const MineTopBar: FC<MineTopBarProps> = memo(({ onNotification }) => {
  const { height, top } = getMenuButtonBoundingClientRect();
  const barHeight = top + height + 5;

  return (
    <>
      <View className="mineTopBar" style={{ height: `${barHeight}px` }}>
        <View className="mineTopBar__inner" style={{ height: `${height}px`, top: `${top}px` }}>
          <View className="mineTopBar__left">
            <View className="mineTopBar__icon">
              <Icon name="user" size={20} color="#005ea4" />
            </View>
            <Text className="mineTopBar__title">个人中心</Text>
          </View>
          <View className="mineTopBar__action" onClick={onNotification}>
            <Icon name="notice" size={20} color="#404752" />
          </View>
        </View>
      </View>
      <View style={{ height: `${barHeight}px` }} />
    </>
  );
});

export default MineTopBar;
