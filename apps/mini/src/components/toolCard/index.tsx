import React, { FC, memo } from "react";
import { Image, View, Text } from "@tarojs/components";
import cs from "classnames";
import { AtIcon } from "taro-ui";
import type { Accent } from "@/pages/classify/constants";
import "./index.scss";

export type ToolCardLayout = "grid" | "list";

export type ToolCardProps = {
  icon: string;
  title: string;
  desc: string;
  accent: Accent;
  heat?: string;
  tag?: string;
  layout?: ToolCardLayout;
  isFavorite?: boolean;
  onClick: () => void;
  onFavoriteToggle?: () => void;
};

const ToolCard: FC<ToolCardProps> = memo(
  ({
    icon,
    title,
    desc,
    accent,
    heat,
    tag,
    layout = "grid",
    isFavorite = false,
    onClick,
    onFavoriteToggle,
  }) => {
    const handleFavoriteToggle = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onFavoriteToggle?.();
    };

    const favoriteBtn = onFavoriteToggle ? (
      <View className="toolCard__favorite" onClick={handleFavoriteToggle}>
        <AtIcon
          value={isFavorite ? "heart-2" : "heart"}
          size="20"
          color={isFavorite ? "#b7131a" : "#707783"}
        />
      </View>
    ) : null;

    if (layout === "list") {
      return (
        <View className="toolCard toolCard--list" onClick={onClick}>
          <View className={cs("toolCard__iconWrap", `toolCard__iconWrap--${accent}`)}>
            <Image className="toolCard__icon" src={icon} mode="aspectFit" />
          </View>
          <View className="toolCard__content">
            <View className="toolCard__listHeader">
              <Text className="toolCard__title">{title}</Text>
              {favoriteBtn}
            </View>
            <Text className="toolCard__listDesc">{desc}</Text>
            {(tag || heat) && (
              <View className="toolCard__tags">
                {tag && <Text className="toolCard__tag">{tag}</Text>}
                {heat && <Text className="toolCard__tag toolCard__tag--heat">热度 {heat}</Text>}
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View className="toolCard" onClick={onClick}>
        <View className="toolCard__header">
          <View className={cs("toolCard__iconWrap", `toolCard__iconWrap--${accent}`)}>
            <Image className="toolCard__icon" src={icon} mode="aspectFit" />
          </View>
          {favoriteBtn}
        </View>
        <View className="toolCard__text">
          <Text className="toolCard__title">{title}</Text>
          <View className="toolCard__meta">
            <Text className="toolCard__desc">{desc}</Text>
            {heat && <Text className="toolCard__heat">热度 {heat}</Text>}
          </View>
        </View>
      </View>
    );
  },
);

export default ToolCard;
