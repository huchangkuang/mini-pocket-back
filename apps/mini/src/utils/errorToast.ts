import { showToast } from "@tarojs/taro";

export const errorToast = (e: any) => {
  if (typeof e === "string") {
    showToast({ icon: "none", title: e, duration: 1500 });
    return;
  }
  if (e instanceof Object && typeof e.message === "string") {
    showToast({ icon: "none", title: e.message, duration: 1500 });
    return;
  }
};
