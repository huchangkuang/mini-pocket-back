import React, { useState } from "react";
import { View, Input, Text, ScrollView } from "@tarojs/components";
import "./index.scss";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { errorToast } from "@/utils/errorToast";
import {
  BarrageType,
  barrageTypeOptions,
  FONT_COLORS,
  BG_COLORS,
} from "@/pages/handsBarrage/constants";
import BarragePreview from "@/components/barragePreview";
import ToolFormCard from "@/components/toolEdit/toolFormCard";
import SegmentedControl from "@/components/toolEdit/segmentedControl";
import ColorSwatchGroup from "@/components/toolEdit/colorSwatchGroup";
import ToolSliderRow from "@/components/toolEdit/toolSliderRow";
import ToolTipCard from "@/components/toolEdit/toolTipCard";
import ToolBottomBar from "@/components/toolEdit/toolBottomBar";

const EditBarrage: React.FC = () => {
  const [fontSize, setFontSize] = useState(64);
  const [fontColor, setFontColor] = useState(FONT_COLORS[0]);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [time, setTime] = useState(5);
  const [barrage, setBarrage] = useState("");
  const [barrageType, setBarrageType] = useState<BarrageType>(
    BarrageType.scroll
  );

  const validateBarrage = () => {
    if (!barrage) {
      return "请输入弹幕内容";
    }
    if (barrage.length > 20) {
      return "弹幕字数限制20字";
    }
  };

  const confirm = () => {
    const msg = validateBarrage();
    if (msg) {
      errorToast(msg);
      return;
    }
    const data = { fontSize, fontColor, time, barrage, bgColor, barrageType };
    Taro.navigateTo({
      url: `/pages/handsBarrage/index?data=${encodeURIComponent(
        JSON.stringify(data)
      )}`,
    });
  };

  useShareAppMessage(() => ({
    title: "手持弹幕",
    path: "/pages/handsBarrage/edit/index",
  }));

  const scrollTimeDisabled = barrageType !== BarrageType.scroll;

  return (
    <View className="editBarrage">
      <ScrollView scrollY className="editBarrage__scroll">
        <View className="editBarrage__content">
          <BarragePreview
            text={barrage}
            fontSize={fontSize}
            fontColor={fontColor}
            bgColor={bgColor}
            barrageType={barrageType}
            scrollTime={time}
          />

          <ToolFormCard icon="edit" title="弹幕内容">
            <View className="editBarrage__inputWrap">
              <Input
                className="editBarrage__input"
                placeholder="输入弹幕内容（限20字）"
                placeholderClass="editBarrage__placeholder"
                maxlength={20}
                value={barrage}
                onInput={(e) => setBarrage(e.detail.value)}
              />
            </View>
            <Text className="editBarrage__charCount">{barrage.length}/20</Text>
          </ToolFormCard>

          <ToolFormCard icon="streaming" title="弹幕形式">
            <SegmentedControl
              options={barrageTypeOptions}
              value={barrageType}
              onChange={setBarrageType}
            />
          </ToolFormCard>

          <View className="editBarrage__grid">
            <ToolFormCard className="editBarrage__gridItem">
              <View className="editBarrage__colorGroups">
                <ColorSwatchGroup
                  label="字体颜色"
                  colors={FONT_COLORS}
                  value={fontColor}
                  onChange={setFontColor}
                />
                <ColorSwatchGroup
                  label="背景颜色"
                  colors={BG_COLORS}
                  value={bgColor}
                  onChange={setBgColor}
                />
              </View>
            </ToolFormCard>

            <ToolFormCard className="editBarrage__gridItem">
              <View className="editBarrage__sliders">
                <ToolSliderRow
                  label="字体大小"
                  value={fontSize}
                  min={20}
                  max={100}
                  unit="px"
                  onChange={setFontSize}
                />
                <ToolSliderRow
                  label="滚动时间"
                  value={time}
                  min={1}
                  max={10}
                  unit="s"
                  disabled={scrollTimeDisabled}
                  onChange={setTime}
                />
              </View>
            </ToolFormCard>
          </View>

          <ToolTipCard>
            小贴士：双击展示页面可以快速返回编辑界面。建议在暗光环境下调高字体亮度以获得最佳展示效果。
          </ToolTipCard>
        </View>
      </ScrollView>

      <ToolBottomBar label="开始展示" icon="play" onClick={confirm} />
    </View>
  );
};

export default EditBarrage;
