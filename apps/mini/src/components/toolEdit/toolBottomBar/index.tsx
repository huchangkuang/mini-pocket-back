import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { getIconComponent } from "@/utils/iconMap";
import "./index.scss";

export type ToolBottomBarProps = {
  label: string;
  icon?: string;
  onClick: () => void;
};

const ToolBottomBar: FC<ToolBottomBarProps> = memo(({ label, icon = "play", onClick }) => {
  return (
    <View className="toolBottomBar">
      <View className="toolBottomBar__btn" onClick={onClick}>
        {React.createElement(getIconComponent(icon), { size: "20", color: "#ffffff" })}
        <Text className="toolBottomBar__label">{label}</Text>
      </View>
    </View>
  );
});

export default ToolBottomBar;
