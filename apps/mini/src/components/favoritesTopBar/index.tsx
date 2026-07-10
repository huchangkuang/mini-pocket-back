import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { getMenuButtonBoundingClientRect } from "@tarojs/taro";
import { AtIcon } from "taro-ui";
import "./index.scss";

export type FavoritesTopBarProps = {
  onFilter?: () => void;
};

const FavoritesTopBar: FC<FavoritesTopBarProps> = memo(({ onFilter }) => {
  const { height, top } = getMenuButtonBoundingClientRect();
  const barHeight = top + height + 5;

  return (
    <>
      <View className="favoritesTopBar" style={{ height: `${barHeight}px` }}>
        <View
          className="favoritesTopBar__inner"
          style={{ height: `${height}px`, top: `${top}px` }}
        >
          <View className="favoritesTopBar__left">
            <View className="favoritesTopBar__icon">
              <AtIcon value="heart" size="20" color="#005ea4" />
            </View>
            <Text className="favoritesTopBar__title">收藏</Text>
          </View>
          <View className="favoritesTopBar__action" onClick={onFilter}>
            <AtIcon value="settings" size="20" color="#404752" />
          </View>
        </View>
      </View>
      <View style={{ height: `${barHeight}px` }} />
    </>
  );
});

export default FavoritesTopBar;
