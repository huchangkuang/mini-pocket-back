import React, { FC, memo } from "react";
import { Image, View, Text } from "@tarojs/components";
import cs from "classnames";
import Icon from "@/components/Icon";
import type { Accent } from "@/pages/classify/constants";
import "./index.scss";

export type FavoriteCardProps = {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  accent: Accent;
  onClick: () => void;
  onUnfavorite: () => void;
};

const FavoriteCard: FC<FavoriteCardProps> = memo(
  ({ icon, title, desc, tag, accent, onClick, onUnfavorite }) => {
    const handleUnfavorite = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onUnfavorite();
    };

    return (
      <View className="favoriteCard" onClick={onClick}>
        <View className={cs("favoriteCard__iconWrap", `favoriteCard__iconWrap--${accent}`)}>
          <Image className="favoriteCard__icon" src={icon} mode="aspectFit" />
        </View>
        <View className="favoriteCard__content">
          <View className="favoriteCard__header">
            <Text className="favoriteCard__title">{title}</Text>
            <View className="favoriteCard__heart" onClick={handleUnfavorite}>
              <Icon name="heart-fill" size={20} color="#b7131a" />
            </View>
          </View>
          <Text className="favoriteCard__desc">{desc}</Text>
          <View className="favoriteCard__tags">
            <Text className="favoriteCard__tag">{tag}</Text>
          </View>
        </View>
      </View>
    );
  },
);

export default FavoriteCard;
