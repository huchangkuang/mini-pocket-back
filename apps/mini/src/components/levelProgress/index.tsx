import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import type { LevelProgressData } from "@/pages/mine/constants";
import "./index.scss";

export type LevelProgressProps = {
  data: LevelProgressData;
  variant: "guest" | "loggedIn";
};

const LevelProgress: FC<LevelProgressProps> = memo(({ data, variant }) => {
  return (
    <View className={`levelProgress levelProgress--${variant}`}>
      <View className="levelProgress__header">
        <View className="levelProgress__titleWrap">
          {data.showMedal && (
            <AtIcon value="star-2" size="16" color="#705d00" />
          )}
          <Text className="levelProgress__title">{data.title}</Text>
        </View>
        <Text className="levelProgress__xp">
          {data.current} / {data.total} XP
        </Text>
      </View>
      <View className="levelProgress__track">
        <View
          className="levelProgress__fill"
          style={{ width: `${data.percent}%` }}
        />
      </View>
      <Text className="levelProgress__hint">{data.hint}</Text>
    </View>
  );
});

export default LevelProgress;
