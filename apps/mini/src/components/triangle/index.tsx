import React from "react";
import Taro, { View } from "@tarojs/components";
import { ViewProps } from "@tarojs/components/types/View";
import cs from "classnames";
import "./index.scss";

type Props = {
  className?: string;
  direction?: "right" | "left" | "up" | "down";
  size?: number;
  color?: string;
} & ViewProps;
const Triangle: React.FC<Props> = (props) => {
  const {
    className,
    direction = "right",
    size = 5,
    color = "#fff",
    ...rest
  } = props;
  const directionMap = {
    right: "borderLeftColor",
    left: "borderRightColor",
    up: "borderBottomColor",
    down: "borderTopColor",
  };
  const style = {
    border: `${size * 2}rpx solid transparent`,
    [directionMap[direction]]: color,
    width: `${size * 2}rpx`,
    height: `${size * 2}rpx`,
  };
  return <View className={cs("triangle", className)} style={style} {...rest} />;
};
export default Triangle;
