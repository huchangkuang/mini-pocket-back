import type { ApiLoginResult, ApiUserMe, ApiUserProfile } from "@/types/api";
import { get, patch, post } from "@/utils/request";

export function wechatLogin(
  code: string,
  profile?: { nickname?: string; avatarUrl?: string },
): Promise<ApiLoginResult> {
  return post<ApiLoginResult>("/auth/wechat/login", { code, ...profile }, false);
}

export function getMe(): Promise<ApiUserMe> {
  return get<ApiUserMe>("/auth/me");
}

export function updateProfile(data: {
  nickname?: string;
  avatarUrl?: string;
}): Promise<ApiUserProfile> {
  return patch<ApiUserProfile>("/auth/profile", data);
}
