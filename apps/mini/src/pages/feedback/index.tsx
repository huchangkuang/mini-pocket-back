import React, { useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Input, ScrollView, Text, Textarea, View } from "@tarojs/components";
import Icon from "@/components/Icon";
import { BomFixed } from "@/components/bomFixed";
import { submitFeedback } from "@/services/feedbackApi";
import { persistStorageFiles, uploadTempFile } from "@/services/storageApi";
import { errorToast } from "@/utils/errorToast";
import type { FeedbackType } from "@/types/api";
import "./index.scss";

const MAX_CONTENT = 200;
const MAX_IMAGES = 3;

type FeedbackImageItem = {
  id: string;
  preview: string;
  ossKey?: string;
  status: "uploading" | "done" | "error";
};

const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "feature", label: "功能建议" },
  { value: "performance", label: "性能问题" },
  { value: "style", label: "样式建议" },
  { value: "other", label: "其他" },
];

const Feedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [images, setImages] = useState<FeedbackImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const uploadOneImage = async (id: string, localPath: string) => {
    try {
      const uploaded = await uploadTempFile(localPath);
      setImages((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ossKey: uploaded.ossKey,
                status: "done",
              }
            : item,
        ),
      );
    } catch (e) {
      setImages((prev) => prev.filter((item) => item.id !== id));
      errorToast(e instanceof Error ? e.message : "图片上传失败");
    }
  };

  const chooseImage = () => {
    if (images.length >= MAX_IMAGES) return;

    Taro.chooseImage({
      count: MAX_IMAGES - images.length,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const paths = res.tempFilePaths.slice(0, MAX_IMAGES - images.length);
        const placeholders: FeedbackImageItem[] = paths.map((path) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          preview: path,
          status: "uploading",
        }));

        setImages((prev) => [...prev, ...placeholders].slice(0, MAX_IMAGES));

        placeholders.forEach((item) => {
          void uploadOneImage(item.id, item.preview);
        });
      },
      fail: (err) => {
        if (err.errMsg?.includes("cancel")) return;
        errorToast("选图失败，请重试");
      },
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      errorToast("请填写您的宝贵反馈内容");
      return;
    }

    if (images.some((item) => item.status === "uploading")) {
      errorToast("图片上传中，请稍候");
      return;
    }

    const ossKeys = images
      .filter((item) => item.status === "done" && item.ossKey)
      .map((item) => item.ossKey as string);

    setSubmitting(true);
    Taro.showLoading({ title: "正在提交...", mask: true });

    try {
      let imageUrls: string[] | undefined;
      if (ossKeys.length > 0) {
        const persisted = await persistStorageFiles(ossKeys, "feedback");
        imageUrls = persisted.files.map((item) => item.url);
      }

      await submitFeedback({
        type: feedbackType,
        content: trimmed,
        contact: contact.trim() || undefined,
        imageUrls,
      });

      Taro.showToast({
        title: "感谢您的反馈！",
        icon: "success",
        duration: 1500,
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 800);
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "提交失败，请稍后重试");
    } finally {
      Taro.hideLoading();
      setSubmitting(false);
    }
  };

  return (
    <View className="feedbackPage">
      <ScrollView scrollY className="feedbackPage__scroll">
        <View className="feedbackPage__content">
          <View className="feedbackPage__section">
            <Text className="feedbackPage__label">反馈类型</Text>
            <View className="feedbackPage__tags">
              {FEEDBACK_TYPE_OPTIONS.map((item) => (
                <View
                  key={item.value}
                  className={`feedbackPage__tag${
                    feedbackType === item.value ? " feedbackPage__tag--active" : ""
                  }`}
                  onClick={() => setFeedbackType(item.value)}
                >
                  <Text className="feedbackPage__tagText">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="feedbackPage__section">
            <View className="feedbackPage__labelRow">
              <Text className="feedbackPage__label">反馈内容</Text>
              <Text className="feedbackPage__count">
                {content.length}/{MAX_CONTENT}
              </Text>
            </View>
            <Textarea
              className="feedbackPage__textarea"
              maxlength={MAX_CONTENT}
              value={content}
              placeholder="请详细描述您的问题或建议..."
              placeholderClass="feedbackPage__placeholder"
              onInput={(e) => setContent(e.detail.value)}
            />
          </View>

          <View className="feedbackPage__section">
            <View className="feedbackPage__labelRow">
              <Text className="feedbackPage__label">上传图片 (可选)</Text>
              <Text className="feedbackPage__hint">最多3张</Text>
            </View>
            <View className="feedbackPage__imageGrid">
              {images.map((item) => (
                <View key={item.id} className="feedbackPage__imageItem">
                  <Image
                    className="feedbackPage__imagePreview"
                    src={item.preview}
                    mode="aspectFill"
                  />
                  {item.status === "uploading" ? (
                    <View className="feedbackPage__imageLoading">
                      <Text className="feedbackPage__imageLoadingText">上传中</Text>
                    </View>
                  ) : null}
                  <View className="feedbackPage__imageRemove" onClick={() => removeImage(item.id)}>
                    <Icon name="close" size={12} color="#ffffff" />
                  </View>
                </View>
              ))}
              {images.length < MAX_IMAGES ? (
                <View className="feedbackPage__imageAdd" onClick={chooseImage}>
                  <Icon name="plus" size={32} color="#707783" />
                  <Text className="feedbackPage__imageAddText">添加截图</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="feedbackPage__info">
            <Icon name="warning" size={20} color="#004881" />
            <Text className="feedbackPage__infoText">
              您的反馈将帮助「百宝口袋工坊」变得更好。我们通常会在 48 小时内处理您的建议。
            </Text>
          </View>
        </View>
      </ScrollView>

      <BomFixed className="feedbackPage__footer">
        <View
          className={`feedbackPage__submit${submitting ? " feedbackPage__submit--disabled" : ""}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Icon name="mail" size={20} color="#ffffff" />
          <Text className="feedbackPage__submitText">{submitting ? "正在提交..." : "提交"}</Text>
        </View>
      </BomFixed>
    </View>
  );
};

export default Feedback;
