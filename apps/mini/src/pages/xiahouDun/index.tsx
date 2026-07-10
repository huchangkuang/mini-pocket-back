import React, { useState } from "react";
import Taro, {
  getMenuButtonBoundingClientRect,
  useDidShow,
  useShareAppMessage,
} from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import { IS_WECHAT } from "@/utils/constant";
import { isFirstPageInStack, navigateBackOrHome } from "@/utils/navigation";
import ToolBottomBar from "@/components/toolEdit/toolBottomBar";
import "./index.scss";

const XiahouDun: React.FC = () => {
  const { height = 0, top = 0 } = getMenuButtonBoundingClientRect();
  const [activated, setActivated] = useState(false);
  const [showHome, setShowHome] = useState(() => isFirstPageInStack());

  useDidShow(() => {
    setShowHome(isFirstPageInStack());
  });

  const handleConfirm = () => {
    if (activated) return;
    setActivated(true);
  };

  useShareAppMessage(() => ({
    title: "夏侯惇模拟器",
    path: "/pages/xiahouDun/index",
  }));

  return (
    <View className="xiahouDun">
      {activated && <View className="xiahouDun__overlay" />}

      {IS_WECHAT && (
        <View style={{ top }} className="xiahouDun__goBack" onClick={navigateBackOrHome}>
          <AtIcon value={showHome ? "home" : "chevron-left"} size={height - 4} />
        </View>
      )}

      <View className="xiahouDun__nav">
        <Text className="xiahouDun__title">夏侯惇模拟器</Text>
      </View>

      <View className="xiahouDun__body">
        {!activated && <ToolBottomBar label="确认" icon="check" onClick={handleConfirm} />}
      </View>
    </View>
  );
};

export default XiahouDun;
