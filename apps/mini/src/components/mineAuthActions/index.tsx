import React, { FC, memo } from "react";
import { Button, View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import "./index.scss";

export type MineAuthActionsProps = {
  isLoggedIn: boolean;
  loggingIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
};

const MineAuthActions: FC<MineAuthActionsProps> = memo(
  ({ isLoggedIn, loggingIn, onLogin, onLogout }) => {
    if (!isLoggedIn) {
      return (
        <View className="mineAuthActions">
          <Button
            className="mineAuthActions__login"
            loading={loggingIn}
            disabled={loggingIn}
            onClick={onLogin}
          >
            <AtIcon value="user" size="20" color="#ffffff" />
            <Text className="mineAuthActions__loginText">重试登录</Text>
          </Button>
        </View>
      );
    }

    return (
      <View className="mineAuthActions mineAuthActions--loggedIn">
        <View className="mineAuthActions__logout" onClick={onLogout}>
          <AtIcon value="close" size="18" color="#404752" />
          <Text className="mineAuthActions__logoutText">退出登录</Text>
        </View>
      </View>
    );
  }
);

export default MineAuthActions;
