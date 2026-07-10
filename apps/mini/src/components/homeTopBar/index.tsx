import React, { FC, memo } from "react";
import { Image, View, Text } from "@tarojs/components";
import { getMenuButtonBoundingClientRect } from "@tarojs/taro";
import logo from "@/images/logo.svg";
import "./index.scss";

const HomeTopBar: FC = memo(() => {
  const { height, top } = getMenuButtonBoundingClientRect();
  const barHeight = top + height + 5;

  return (
    <>
      <View className="homeTopBar" style={{ height: `${barHeight}px` }}>
        <View
          className="homeTopBar__inner"
          style={{ height: `${height}px`, top: `${top}px` }}
        >
          <View className="homeTopBar__brand">
            <Image className="homeTopBar__logo" src={logo} mode="aspectFit" />
            <Text className="homeTopBar__title">百宝口袋工坊</Text>
          </View>
        </View>
      </View>
      <View style={{ height: `${barHeight}px` }} />
    </>
  );
});

export default HomeTopBar;
