import React, { useMemo, useRef } from "react";
import { View } from "@tarojs/components";
import "./index.scss";
import Taro from "@tarojs/taro";
import classNames from "classnames";
import { classMap } from "@/pages/handsBarrage/constants";
import cs from "classnames";
import { navigateBackOrHome } from "@/utils/navigation";

const HandsBarrage: React.FC = () => {
  const {
    params: { data = "" },
  } = Taro.useRouter();
  const { windowWidth, windowHeight } = Taro.getSystemInfoSync();
  const confirmQuit = useRef(false);
  const {
    fontSize,
    fontColor,
    time,
    barrage,
    bgColor,
    barrageType = 0,
  } = useMemo(() => {
    if (data) {
      return JSON.parse(decodeURIComponent(data));
    }
    return {};
  }, [data]);
  const typeClass = useMemo(() => classMap[barrageType], [barrageType]);
  const exist = () => {
    if (!confirmQuit.current) {
      Taro.showToast({
        title: "再次点击可退出弹幕",
        icon: "none",
        duration: 500,
      });
      confirmQuit.current = true;
      cancelQuit();
      return;
    }
    navigateBackOrHome();
  };
  const cancelQuit = () => {
    setTimeout(() => {
      confirmQuit.current = false;
    }, 500);
  };
  return (
    <View
      onClick={exist}
      style={{
        background: bgColor,
      }}
      className={classNames(
        "handsBarrage",
        windowWidth > windowHeight && "noRotate"
      )}
    >
      <View
        className={cs("scrollText", typeClass)}
        style={{
          fontSize,
          color: fontColor,
          // @ts-ignore
          "--time": `${time}s`,
        }}
      >
        {barrage}
      </View>
    </View>
  );
};
export default HandsBarrage;
