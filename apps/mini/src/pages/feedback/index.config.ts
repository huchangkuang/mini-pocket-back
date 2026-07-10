import { IS_WECHAT } from "@/utils/constant";

export default definePageConfig({
  navigationBarTitleText: "意见反馈",
  navigationBarBackgroundColor: IS_WECHAT ? "#f7f9fc" : undefined,
  navigationBarTextStyle: "black",
});
