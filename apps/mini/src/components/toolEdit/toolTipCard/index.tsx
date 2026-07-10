import React, { FC, memo, PropsWithChildren } from "react";
import { View, Text } from "@tarojs/components";
import Icon from "@/components/Icon";
import "./index.scss";

export type ToolTipCardProps = PropsWithChildren;

const ToolTipCard: FC<ToolTipCardProps> = memo(({ children }) => {
  return (
    <View className="toolTipCard">
      <Icon name="warning" size={20} color="#005ea4" />
      <Text className="toolTipCard__text">{children}</Text>
    </View>
  );
});

export default ToolTipCard;
