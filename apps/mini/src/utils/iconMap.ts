import React from "react";
import Icon, { type IconName } from "@/components/Icon";

import barrageIcon from "@/images/classify/barrage.svg";
import decisionIcon from "@/images/classify/decision.svg";
import fingerUp from "@/images/classify/fingerUp.svg";
import qrcode from "@/images/classify/qrcode.svg";
import metronome from "@/images/classify/metronome.svg";
import lottery from "@/images/classify/lottery.svg";
import clock from "@/images/classify/clock.svg";
import randomIcon from "@/images/classify/random.svg";
import timeTravelIcon from "@/images/classify/timeTravel.svg";
import xiahouDunIcon from "@/images/classify/xiahouDun.svg";
import hawkingIcon from "@/images/classify/hawking.svg";

// NutUI icon 名称到 kebab-case 的映射（兼容旧 iconMap 调用）
const iconNameMap: Record<string, IconName> = {
  search: "search",
  user: "user",
  bell: "notice",
  play: "play-start",
  pause: "play-stop",
  close: "close",
  add: "add",
  subtract: "minus",
  check: "check",
  settings: "setting",
  edit: "edit",
  share: "share",
  heart: "heart",
  "heart-2": "heart-fill",
  "star-2": "star-fill",
  loading: "loading",
  image: "volume-max",
  "map-pin": "location",
  mail: "mail",
  "chevron-right": "arrow-right",
  "chevron-left": "arrow-left",
  "close-circle": "close",
  "add-circle": "add",
  "subtract-circle": "del",
  "check-circle": "check-checked",
  "alert-circle": "warning",
  streaming: "volume-max",
  sound: "volume-max",
  more: "more",
  message: "message",
  home: "home",
};

// Map API icon keys to SVG image paths
const ICON_MAP: Record<string, string> = {
  barrage: barrageIcon,
  decision: decisionIcon,
  fingerUp,
  qrcode,
  metronome,
  lottery,
  clock,
  random: randomIcon,
  timeTravel: timeTravelIcon,
  xiahouDun: xiahouDunIcon,
  hawking: hawkingIcon,
};

const DEFAULT_ICON = randomIcon;

/**
 * 获取图标渲染组件（兼容旧 taro-ui iconMap 接口）
 * 用于 toolCard 等需要动态图标的场景
 */
export function getIconComponent(iconName: string): React.ComponentType<any> {
  const mappedName = iconNameMap[iconName];
  if (mappedName) {
    // 返回使用自定义 Icon 的组件
    const IconComponent: React.ComponentType<any> = (props: any) => {
      const { size, color, ...rest } = props || {};
      return React.createElement(Icon, {
        name: mappedName,
        size: size || 24,
        color,
        ...rest,
      });
    };
    return IconComponent;
  }
  // Fallback: return a component that renders nothing (was VolumeMax)
  return (props: any) => {
    const { size } = props || {};
    return React.createElement(Icon, { name: "volume-max", size: size || 24 });
  };
}

export function resolveIconKey(iconKey: string): string {
  return ICON_MAP[iconKey] ?? DEFAULT_ICON;
}
