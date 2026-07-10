import { IS_WECHAT } from "@/utils/constant";

export default definePageConfig({
  navigationBarTitleText: "做个决定吧",
  navigationBarBackgroundColor: IS_WECHAT ? "#f7f9fc" : undefined,
  navigationBarTextStyle: "black",
  enableShareAppMessage: true,
  enableShareTimeline: true,
});
