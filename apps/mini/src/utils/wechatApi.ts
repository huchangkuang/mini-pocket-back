import Taro, {
  authorize,
  canvasToTempFilePath,
  getSetting,
  saveImageToPhotosAlbum,
  showToast,
} from "@tarojs/taro";
import { errorToast } from "@/utils/errorToast";
import { WechatPayRes } from "@/utils/type";
import { IS_WECHAT } from "@/utils/constant";

export const wechatPayment = (payString: Omit<WechatPayRes, "tradeNo">) => {
  return new Promise((resolve, reject) => {
    if (IS_WECHAT) {
      Taro.requestPayment({
        timeStamp: payString.timeStamp,
        nonceStr: payString.nonceStr,
        package: payString.package,
        signType: payString.signType as any,
        paySign: payString.paySign,
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        },
      });
    }
  });
};
export const getWechatSetting = async () => {
  return new Promise((resolve, reject) => {
    getSetting({
      //获取权限
      success: (res) => {
        if (res.authSetting["scope.writePhotosAlbum"]) {
          resolve(res);
        } else {
          authorize({
            scope: "scope.writePhotosAlbum",
            success(result) {
              resolve(result);
            },
            fail(err) {
              reject(err);
            },
          });
        }
      },
    });
  });
};
export const canvasSaveImg = (
  canvasId: string,
  option?: Taro.canvasToTempFilePath.Option
) => {
  return new Promise((resolve, reject) => {
    canvasToTempFilePath({
      ...option,
      canvasId,
      success: (res) => {
        saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            showToast({
              title: "保存成功",
              icon: "none",
            });
            resolve(res);
          },
          fail: function () {
            errorToast("保存失败");
            reject(res);
          },
        });
      },
      fail: function (res) {
        errorToast("保存失败");
        reject(res);
      },
    });
  });
};
