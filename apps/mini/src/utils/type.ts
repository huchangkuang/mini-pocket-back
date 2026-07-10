export type WechatPayRes = {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: "MD5" | "HMAC-SHA256" | "RSA";
  paySign: string;
  tradeNo: string;
};
