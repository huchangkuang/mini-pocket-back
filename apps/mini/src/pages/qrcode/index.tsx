import React, { useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { Canvas, Textarea, View } from "@tarojs/components";
import "./index.scss";
import { createCanvasContext, hideLoading, showLoading } from "@tarojs/taro";
import { BomFixed } from "@/components/bomFixed";
import qrcode from "@/utils/code/qrcode";
import { canvasSaveImg, getWechatSetting } from "@/utils/wechatApi";
import { errorToast } from "@/utils/errorToast";
import { AtButton } from "taro-ui";

const Qrcode: React.FC = () => {
  const [text, setText] = useState("");
  const [showCode, setShowCode] = useState(false);
  const canvasSize = 300;
  const drawQrCode = async () => {
    showLoading({ title: "生成二维码中", mask: true });
    try {
      await qrcode.api.draw(
        text,
        {
          ctx: createCanvasContext("qrcode"),
          width: canvasSize,
          height: canvasSize,
        },
        canvasSize,
        4
      );
      setShowCode(true);
      hideLoading();
    } catch (e) {
      errorToast(e);
    }
  };
  const save = async () => {
    if (!text && !showCode) {
      errorToast("请先输入文本生成二维码");
      return;
    }
    try {
      await getWechatSetting();
      await canvasSaveImg("qrcode");
    } catch (e) {
      console.log(e);
    }
  };
  useShareAppMessage(() => {
    return {
      title: "二维码生成",
      path: "/pages/qrcode/index",
    };
  });
  return (
    <View className="qrcode">
      <View className="card">
        <Textarea
          onInput={(e) => setText(e.detail.value)}
          maxlength={500}
          placeholder="请输入文本，生成对应的二维码"
          onBlur={drawQrCode}
        />
      </View>
      {text && showCode && (
        <View className="card codeWrap">
          <Canvas id="qrcode" canvasId="qrcode" />
        </View>
      )}
      <BomFixed>
        <View className="bomBtn">
          <AtButton type="primary" onClick={save}>
            保存二维码
          </AtButton>
        </View>
      </BomFixed>
    </View>
  );
};
export default Qrcode;
