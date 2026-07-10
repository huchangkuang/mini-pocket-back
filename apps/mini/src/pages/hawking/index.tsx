import React, { useState } from "react";
import Taro, {
  getMenuButtonBoundingClientRect,
  useDidShow,
  useShareAppMessage,
} from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import cs from "classnames";
import { IS_WECHAT } from "@/utils/constant";
import { isFirstPageInStack, navigateBackOrHome } from "@/utils/navigation";
import "./index.scss";

const Hawking: React.FC = () => {
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
    title: "霍金模拟器",
    path: "/pages/hawking/index",
  }));

  return (
    <View className="hawking">
      <View
        className={cs(
          "hawking__screen",
          activated && "hawking__screen--rotated"
        )}
      >
        {IS_WECHAT && (
          <View
            style={{ top }}
            className="hawking__goBack"
            onClick={navigateBackOrHome}
          >
            <AtIcon
              value={showHome ? "home" : "chevron-left"}
              size={height - 4}
            />
          </View>
        )}

        <View className="hawking__nav">
          <Text className="hawking__title">霍金模拟器</Text>
        </View>

        <View className="hawking__body">
          <View className="hawking__preview">
            <Text className="hawking__previewText">
              {activated ? "屏幕已倾斜" : "等待确认..."}
            </Text>
          </View>

          {!activated && (
            <View className="hawking__confirm" onClick={handleConfirm}>
              <AtIcon value="check" size="20" color="#ffffff" />
              <Text className="hawking__confirmLabel">确认</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Hawking;
