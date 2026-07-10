import { IS_WECHAT } from "@/utils/constant";

export default definePageConfig({
  navigationBarTitleText: "反方向的钟",
  navigationBarBackgroundColor: IS_WECHAT ? "#f7f9fc" : undefined,
  navigationBarTextStyle: "black",
  enableShareAppMessage: true,
  enableShareTimeline: true,
});
