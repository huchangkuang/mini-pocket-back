import React, { FC, memo, PropsWithChildren } from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import "./index.scss";

export type ToolFormCardProps = PropsWithChildren<{
  icon?: string;
  title?: string;
  className?: string;
}>;

const ToolFormCard: FC<ToolFormCardProps> = memo(
  ({ icon, title, className, children }) => {
    const showHeader = Boolean(icon || title);

    return (
      <View className={`toolFormCard ${className ?? ""}`}>
        {showHeader ? (
          <View className="toolFormCard__header">
            {icon ? <AtIcon value={icon} size="18" color="#005ea4" /> : null}
            {title ? (
              <Text className="toolFormCard__title">{title}</Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </View>
    );
  }
);

export default ToolFormCard;
