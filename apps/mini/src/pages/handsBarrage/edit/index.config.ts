import { IS_WECHAT } from "@/utils/constant";

export default definePageConfig({
  navigationBarTitleText: "弹幕编辑",
  navigationBarBackgroundColor: IS_WECHAT ? "#f7f9fc" : undefined,
  enableShareAppMessage: true,
  enableShareTimeline: true,
});
