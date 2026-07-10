import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import type { StatItem } from "@/pages/mine/constants";
import "./index.scss";

export type StatsGridProps = {
  items: StatItem[];
};

const StatsGrid: FC<StatsGridProps> = memo(({ items }) => {
  return (
    <View className="statsGrid">
      {items.map((item) => (
        <View key={item.label} className="statsGrid__item">
          <Text className={`statsGrid__value statsGrid__value--${item.color}`}>
            {item.value}
          </Text>
          <Text className="statsGrid__label">{item.label}</Text>
        </View>
      ))}
    </View>
  );
});

export default StatsGrid;
