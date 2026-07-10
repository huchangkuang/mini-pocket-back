import React, { FC, memo } from "react";
import { View, Text, Image } from "@tarojs/components";
import avatarPlaceholder from "@/images/mine/avatar-placeholder.svg";
import "./index.scss";

export type ProfileHeaderGuestProps = {
  onLogin?: () => void;
};

const ProfileHeaderGuest: FC<ProfileHeaderGuestProps> = memo(({ onLogin }) => {
  return (
    <View className="profileHeaderGuest">
      <View className="profileHeaderGuest__decor" />
      <View className="profileHeaderGuest__avatarWrap">
        <Image
          className="profileHeaderGuest__avatar"
          src={avatarPlaceholder}
          mode="aspectFill"
        />
      </View>
      <View className="profileHeaderGuest__content">
        <Text className="profileHeaderGuest__cta" onClick={() => onLogin?.()}>
          登录失败，点击重试
        </Text>
        <Text className="profileHeaderGuest__desc">
          百宝口袋工坊将自动登录，同步您的工具配置与收藏
        </Text>
      </View>
    </View>
  );
});

export default ProfileHeaderGuest;
