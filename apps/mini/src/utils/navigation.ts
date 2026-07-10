import Taro from "@tarojs/taro";

const CLASSIFY_TAB = "/pages/classify/index";

export function isFirstPageInStack(): boolean {
  return Taro.getCurrentPages().length <= 1;
}

export function navigateBackOrHome(): void {
  if (isFirstPageInStack()) {
    Taro.switchTab({ url: CLASSIFY_TAB });
    return;
  }
  Taro.navigateBack();
}
