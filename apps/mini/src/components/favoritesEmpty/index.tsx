import React, { FC, memo } from "react";
import { Button, Image, View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import emptyHeart from "@/images/favorites/empty-heart.svg";
import "./index.scss";

export type FavoritesEmptyProps = {
  variant?: "empty" | "guest";
  loading?: boolean;
  onLogin?: () => void;
};

const FavoritesEmpty: FC<FavoritesEmptyProps> = memo(
  ({ variant = "empty", loading, onLogin }) => {
    const goDiscover = () => {
      Taro.switchTab({ url: "/pages/classify/index" });
    };

    const isGuest = variant === "guest";

    return (
      <View className="favoritesEmpty">
        <Image
          className="favoritesEmpty__illustration"
          src={emptyHeart}
          mode="aspectFit"
        />
        <Text className="favoritesEmpty__title">
          {isGuest ? "登录失败" : "还没有收藏的工具"}
        </Text>
        <Text className="favoritesEmpty__desc">
          {isGuest
            ? "自动登录未成功，请稍后重试"
            : "去工作坊逛逛，发现让你心动的百宝工具吧！"}
        </Text>
        <Button
          className="favoritesEmpty__cta"
          loading={loading}
          disabled={loading}
          onClick={isGuest ? onLogin : goDiscover}
        >
          <Text className="favoritesEmpty__ctaText">
            {isGuest ? "重试登录" : "去发现"}
          </Text>
        </Button>
      </View>
    );
  }
);

export default FavoritesEmpty;
