import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { openToolPage } from "@/utils/statsSync";
import "./index.scss";

const FeaturedBanner: FC = memo(() => {
  const goFingerUp = () => {
    openToolPage("/pages/fingerUp/index");
  };

  return (
    <View className="featuredBanner">
      <View className="featuredBanner__deco featuredBanner__deco--lg" />
      <View className="featuredBanner__deco featuredBanner__deco--sm" />
      <View className="featuredBanner__content">
        <Text className="featuredBanner__label">今日推荐</Text>
        <Text className="featuredBanner__title">全新工具上线</Text>
        <Text className="featuredBanner__desc">探索指尖轮盘 2.0，有趣更智能</Text>
      </View>
      <View className="featuredBanner__cta" onClick={goFingerUp}>
        <Text className="featuredBanner__ctaText">立即查看</Text>
      </View>
    </View>
  );
});

export default FeaturedBanner;
