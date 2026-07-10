export enum BarrageType {
  scroll,
  bounce,
  static,
}

export type BarrageTypeStr = "滚动弹幕" | "抖动文字" | "静止弹幕";

export const barrageTypeMap: Record<BarrageType, BarrageTypeStr> = {
  [BarrageType.scroll]: "滚动弹幕",
  [BarrageType.bounce]: "抖动文字",
  [BarrageType.static]: "静止弹幕",
};

export const BarrageTypeRange: BarrageTypeStr[] = ["滚动弹幕", "抖动文字", "静止弹幕"];

export const classMap = {
  [BarrageType.scroll]: "scroll",
  [BarrageType.bounce]: "bounce",
  [BarrageType.static]: "static",
};

export const FONT_COLORS = ["#ffffff", "#fdd835", "#ff5252", "#40c4ff"];

export const BG_COLORS = ["#000000", "#0060a8", "#b7131a"];

export const barrageTypeOptions = [
  { label: barrageTypeMap[BarrageType.scroll], value: BarrageType.scroll },
  { label: barrageTypeMap[BarrageType.bounce], value: BarrageType.bounce },
  { label: barrageTypeMap[BarrageType.static], value: BarrageType.static },
];
