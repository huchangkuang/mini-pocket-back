import Taro from "@tarojs/taro";
import { getMe, wechatLogin } from "@/services/authApi";
import {
  clearAuth,
  getToken,
  hydrateUserFromStorage,
  setSessionReady,
  setToken,
  setUser,
} from "@/utils/authStore";
import { DEFAULT_USER_LEVEL } from "@/utils/levelMapper";

/** 静默微信登录：仅 code 换 token，不获取头像昵称 */
export async function performSilentLogin(): Promise<boolean> {
  try {
    const { code } = await Taro.login();
    if (!code) return false;

    const result = await wechatLogin(code);
    setToken(result.token);
    setUser({
      ...result.user,
      stats: {
        favoriteCount: 0,
        activeDaysCount: 0,
        usedToolsCount: 0,
        totalXp: 0,
      },
      level: DEFAULT_USER_LEVEL,
    });

    const user = await getMe();
    setUser(user);
    return true;
  } catch {
    return false;
  }
}

export async function restoreSession(): Promise<void> {
  const token = getToken();

  if (!token) {
    await performSilentLogin();
    setSessionReady(true);
    return;
  }

  hydrateUserFromStorage();

  try {
    const user = await getMe();
    setUser(user);
  } catch {
    clearAuth();
    await performSilentLogin();
  } finally {
    setSessionReady(true);
  }
}
