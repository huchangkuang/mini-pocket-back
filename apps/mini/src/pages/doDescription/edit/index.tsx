import React, { useEffect, useState } from "react";
import { Image, Input, ScrollView, Text, View } from "@tarojs/components";
import "./index.scss";
import Icon from "@/components/Icon";
import type { Accent } from "@/pages/classify/constants";
import decisionIcon from "@/images/classify/decision.svg";
import terminalIcon from "@/images/common/terminal.svg";
import { decisionConfig } from "@/pages/doDescription/store";
import { saveDecision } from "@/utils/decisionBridge";
import { errorToast } from "@/utils/errorToast";
import Taro, { setNavigationBarTitle, useRouter } from "@tarojs/taro";
import { navigateBackOrHome } from "@/utils/navigation";

const ACCENTS: Accent[] = ["primary", "tertiary", "secondary"];
const PLACEHOLDER_MSG = "更多功能正在开发中...";

type OptionRowProps = {
  value: string;
  index: number;
  variant: "edit" | "add";
  onChange: (value: string) => void;
  onRemove: () => void;
};

const OptionRow: React.FC<OptionRowProps> = ({ value, index, variant, onChange, onRemove }) => {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <View className={`editDecision__option editDecision__option--${variant}`}>
      <View
        className={`editDecision__optionIcon editDecision__optionIcon--${accent} editDecision__optionIcon--${variant}`}
      >
        <Image className="editDecision__optionIconImg" src={decisionIcon} mode="aspectFit" />
      </View>
      <View className="editDecision__optionInputWrap">
        <Input
          className="editDecision__input editDecision__input--option"
          maxlength={20}
          value={value}
          placeholder="输入选项"
          placeholderClass="editDecision__placeholder"
          onInput={(e) => onChange(e.detail.value)}
        />
      </View>
      <View className="editDecision__optionRemove" onClick={onRemove}>
        <Icon name="del" size={18} color="#ba1a1a" />
      </View>
    </View>
  );
};

const EditDecision: React.FC = () => {
  const {
    params: { type = "edit", id = "" },
  } = useRouter();
  const isAdd = type === "add";
  const [list, setList] = useState<string[]>(decisionConfig.list);
  const [title, setTitle] = useState(decisionConfig.title);

  const subtract = (index: number) => {
    if (list.length <= 2) {
      errorToast("至少保留两个选项");
      return;
    }
    setList((data) => data.filter((_, i) => i !== index));
  };

  const onSave = async () => {
    const newList = list.map((i) => i.trim()).filter(Boolean);
    if (newList.length < 2) {
      errorToast("至少填写两个选项");
      return;
    }

    const trimmedTitle = title.trim() || decisionConfig.title;
    Taro.showLoading({ title: "保存中...", mask: true });

    try {
      const apiIdFromRoute = id && /^\d+$/.test(id) ? Number(id) : decisionConfig.apiId;

      await saveDecision({
        type: isAdd ? "add" : "edit",
        id: id || undefined,
        apiId: apiIdFromRoute,
        title: trimmedTitle,
        options: newList,
        editCurrent: !isAdd && !id,
      });
      navigateBackOrHome();
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "保存失败");
    } finally {
      Taro.hideLoading();
    }
  };

  useEffect(() => {
    setNavigationBarTitle({ title: isAdd ? "添加常用" : "编辑转盘" });
  }, [isAdd]);

  const optionCount = list.filter((i) => i.trim()).length;

  return (
    <View className="editDecision">
      <ScrollView scrollY className="editDecision__scroll">
        <View className="editDecision__content">
          {isAdd ? (
            <View className="editDecision__hero editDecision__hero--add">
              <Text className="editDecision__heroTag">决策主题</Text>
              <Text className="editDecision__heroTitle">去决定！！！</Text>
              <View className="editDecision__titleInputWrap">
                <View className="editDecision__inputWrap editDecision__inputWrap--card">
                  <Input
                    className="editDecision__input editDecision__input--withIcon"
                    maxlength={20}
                    value={title}
                    placeholder="今晚吃什么？"
                    placeholderClass="editDecision__placeholder"
                    onInput={(e) => setTitle(e.detail.value)}
                  />
                </View>
                <Icon
                  className="editDecision__titleInputIcon"
                  name="edit"
                  size={16}
                  color="#0077ce"
                />
              </View>
            </View>
          ) : (
            <>
              <View className="editDecision__hero editDecision__hero--edit">
                <View className="editDecision__heroBadge">
                  <Icon name="setting" size={14} color="#005ea4" />
                  <Text className="editDecision__heroBadgeText">DECISION TOOL</Text>
                </View>
                <Text className="editDecision__heroTitle">去决定！！！</Text>
                <Text className="editDecision__heroDesc">给你的犹豫一个充满趣味的答案。</Text>
              </View>
              <View className="editDecision__questionCard">
                <Text className="editDecision__questionLabel">你的问题</Text>
                <View className="editDecision__inputWrap editDecision__inputWrap--inset">
                  <Input
                    className="editDecision__input"
                    maxlength={20}
                    value={title}
                    placeholder="输入你的决策难题..."
                    placeholderClass="editDecision__placeholder"
                    onInput={(e) => setTitle(e.detail.value)}
                  />
                </View>
              </View>
            </>
          )}

          <View className="editDecision__optionsSection">
            <View className="editDecision__optionsHeader">
              <Text className="editDecision__optionsTitle">{isAdd ? "选择选项" : "选择"}</Text>
              <Text className="editDecision__optionsCount">
                已添加 {optionCount} 个{isAdd ? "" : "选项"}
              </Text>
            </View>
            <View className="editDecision__optionsList">
              {list.map((item, index) => (
                <OptionRow
                  key={index}
                  value={item}
                  index={index}
                  variant={isAdd ? "add" : "edit"}
                  onChange={(val) => setList((data) => data.map((d, i) => (i === index ? val : d)))}
                  onRemove={() => subtract(index)}
                />
              ))}
            </View>
            <View className="editDecision__addOption" onClick={() => setList([...list, ""])}>
              <Icon name="plus" size={18} color="#005ea4" />
              <Text className="editDecision__addOptionText">添加选项</Text>
            </View>
          </View>

          {isAdd ? (
            <View className="editDecision__illustration">
              <Image
                className="editDecision__illustrationImg"
                src={decisionIcon}
                mode="aspectFit"
              />
              <Text className="editDecision__illustrationText">
                添加您最常用的决策场景，让「口袋工坊」帮您快速搞定选择恐惧症。
              </Text>
            </View>
          ) : (
            <View className="editDecision__smartBanner" onClick={() => errorToast(PLACEHOLDER_MSG)}>
              <View className="editDecision__smartBannerText">
                <Text className="editDecision__smartBannerTitle">智能生成?</Text>
                <Text className="editDecision__smartBannerDesc">
                  让百宝口袋为你生成推荐的选择集。
                </Text>
              </View>
              <View className="editDecision__smartBannerIcon">
                <Image
                  className="editDecision__smartBannerIconImg"
                  src={terminalIcon}
                  mode="aspectFit"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={`editDecision__footer${isAdd ? " editDecision__footer--add" : ""}`}>
        <View
          className={`editDecision__saveBtn${isAdd ? " editDecision__saveBtn--add" : ""}`}
          onClick={onSave}
        >
          {isAdd && <Icon name="check" size={18} color="#fdfcff" />}
          <Text className="editDecision__saveBtnText">保存</Text>
        </View>
        {!isAdd && <Text className="editDecision__footerHint">修改后将即时同步到主页转盘</Text>}
      </View>
    </View>
  );
};

export default EditDecision;
