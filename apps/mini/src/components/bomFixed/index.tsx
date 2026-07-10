import React, {
  CSSProperties,
  FC,
  Fragment,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import Taro, { View } from "@tarojs/components";
import cs from "classnames";
import { createSelectorQuery } from "@tarojs/taro";
import { eventCenter } from "@tarojs/runtime";
import "./index.scss";

interface BomFixedProps extends PropsWithChildren {
  className?: string;
  hasPlace?: boolean;
  style?: CSSProperties;
}
export const BomFixed: FC<BomFixedProps> = ({
  className,
  children,
  style,
  hasPlace = true,
}) => {
  const [placeHeight, setPlaceHeight] = useState(0);

  const calcHeight = () => {
    const query = createSelectorQuery();
    query
      .select(".bomFixed")
      .boundingClientRect((rect: any) => {
        const height = rect?.height ?? 0;
        setPlaceHeight(height);
        eventCenter.trigger("bomHeight", height);
      })
      .exec();
  };
  useEffect(() => {
    setTimeout(() => {
      calcHeight();
    }, 2000);
  }, []);
  return (
    <Fragment>
      {hasPlace && <View style={{ height: placeHeight }} />}
      <View className={cs(className, "bomFixed")} style={style}>
        {children}
      </View>
    </Fragment>
  );
};
