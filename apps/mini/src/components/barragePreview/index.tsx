import React, { FC, memo, useMemo } from "react";
import { View, Text } from "@tarojs/components";
import cs from "classnames";
import { BarrageType, classMap } from "@/pages/handsBarrage/constants";
import "./index.scss";

export const PREVIEW_SCALE = 0.45;

export type BarragePreviewProps = {
  text: string;
  fontSize: number;
  fontColor: string;
  bgColor: string;
  barrageType: BarrageType;
  scrollTime: number;
};

const BarragePreview: FC<BarragePreviewProps> = memo(
  ({ text, fontSize, fontColor, bgColor, barrageType, scrollTime }) => {
    const displayText = text || "输入弹幕内容...";
    const typeClass = classMap[barrageType];
    const previewFontSize = Math.round(fontSize * PREVIEW_SCALE);

    const textStyle = useMemo(
      () =>
        ({
          fontSize: `${previewFontSize}px`,
          color: fontColor,
          "--time": `${scrollTime}s`,
        } as React.CSSProperties),
      [previewFontSize, fontColor, scrollTime]
    );

    return (
      <View className="barragePreview">
        <View
          className="barragePreview__screen"
          style={{ backgroundColor: bgColor }}
        >
          <View className="barragePreview__badge">
            <Text className="barragePreview__badgeText">LIVE PREVIEW</Text>
          </View>
          <View className="barragePreview__content">
            <Text
              className={cs("barragePreview__text", typeClass)}
              style={textStyle}
            >
              {displayText}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

export default BarragePreview;
