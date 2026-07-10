import React, { FC, memo, useEffect, useRef, useState } from "react";
import Taro from "@tarojs/taro";
import { Button, View, Text, Image, Input } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import avatarDemo from "@/images/mine/avatar-demo.svg";
import "./index.scss";

export type ProfileLoggedInUser = {
  nickname: string;
  joinDate: string;
  badge: string;
  avatarUrl?: string | null;
};

export type ProfileHeaderLoggedInProps = {
  user: ProfileLoggedInUser;
  savingNickname?: boolean;
  onAvatarChoose?: (tempPath: string) => void;
  onNicknameSave?: (nickname: string) => void | Promise<void>;
};

const ProfileHeaderLoggedIn: FC<ProfileHeaderLoggedInProps> = memo(
  ({ user, savingNickname, onAvatarChoose, onNicknameSave }) => {
    const avatarSrc = user.avatarUrl || avatarDemo;
    const [isEditingName, setIsEditingName] = useState(false);
    const [inputFocus, setInputFocus] = useState(false);
    const draftRef = useRef(user.nickname);

    useEffect(() => {
      if (!isEditingName) {
        draftRef.current = user.nickname;
      }
    }, [user.nickname, isEditingName]);

    useEffect(() => {
      if (!isEditingName) {
        setInputFocus(false);
        return;
      }

      const timer = setTimeout(() => setInputFocus(true), 100);
      return () => clearTimeout(timer);
    }, [isEditingName]);

    const startEditing = () => {
      if (savingNickname) return;
      draftRef.current = user.nickname;
      setIsEditingName(true);
    };

    const cancelEditing = () => {
      if (savingNickname) return;
      draftRef.current = user.nickname;
      setIsEditingName(false);
      setInputFocus(false);
    };

    const saveNickname = async () => {
      if (savingNickname) return;

      const trimmed = draftRef.current.trim();
      if (!trimmed) {
        Taro.showToast({ title: "请输入昵称", icon: "none", duration: 1500 });
        return;
      }

      if (trimmed === user.nickname) {
        cancelEditing();
        return;
      }

      try {
        await onNicknameSave?.(trimmed);
        setIsEditingName(false);
        setInputFocus(false);
      } catch {
        // 保存失败时保持编辑态，便于用户修改后重试
      }
    };

    return (
      <View className="profileHeaderLoggedIn">
        <Button
          className="profileHeaderLoggedIn__avatarBtn"
          openType="chooseAvatar"
          onChooseAvatar={(e) => onAvatarChoose?.(e.detail.avatarUrl)}
        >
          <View className="profileHeaderLoggedIn__avatarWrap">
            <Image className="profileHeaderLoggedIn__avatar" src={avatarSrc} mode="aspectFill" />
          </View>
        </Button>

        <View className="profileHeaderLoggedIn__info">
          {isEditingName ? (
            <View className="profileHeaderLoggedIn__nameRow">
              <Input
                key={`nickname-edit-${user.nickname}`}
                className="profileHeaderLoggedIn__nameInput"
                type="nickname"
                defaultValue={user.nickname}
                focus={inputFocus}
                maxlength={32}
                confirmType="done"
                disabled={savingNickname}
                placeholder="请输入昵称"
                onInput={(e) => {
                  draftRef.current = e.detail.value;
                }}
                onConfirm={saveNickname}
                onNickNameReview={(e) => {
                  const detail = e.detail as {
                    pass?: boolean;
                    nickname?: string;
                  };
                  if (detail.pass === false) return;
                  if (detail.nickname) {
                    draftRef.current = detail.nickname;
                  }
                }}
              />
              <View className="profileHeaderLoggedIn__nameActions">
                <Text
                  className="profileHeaderLoggedIn__nameAction profileHeaderLoggedIn__nameAction--save"
                  onClick={saveNickname}
                >
                  {savingNickname ? "保存中" : "保存"}
                </Text>
                <Text
                  className="profileHeaderLoggedIn__nameAction profileHeaderLoggedIn__nameAction--cancel"
                  onClick={cancelEditing}
                >
                  取消
                </Text>
              </View>
            </View>
          ) : (
            <Text className="profileHeaderLoggedIn__name" onClick={startEditing}>
              {user.nickname}
            </Text>
          )}
          <Text className="profileHeaderLoggedIn__date">加入于 {user.joinDate}</Text>
          <View className="profileHeaderLoggedIn__badge">
            <AtIcon value="star-2" size="12" color="#005ea4" />
            <Text className="profileHeaderLoggedIn__badgeText">{user.badge}</Text>
          </View>
        </View>

        {!isEditingName && (
          <View className="profileHeaderLoggedIn__edit" onClick={startEditing}>
            <AtIcon value="edit" size="20" color="#005ea4" />
          </View>
        )}
      </View>
    );
  },
);

export default ProfileHeaderLoggedIn;
