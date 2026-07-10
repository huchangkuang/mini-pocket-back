import Taro from "@tarojs/taro";
import { uploadAvatarFile } from "@/services/storageApi";
import { updateProfile } from "@/services/authApi";

export type LoginProfile = {
  nickname?: string;
  avatarTempPath?: string;
};

function isLocalTempPath(path: string): boolean {
  return (
    path.startsWith("wxfile://") ||
    path.startsWith("http://tmp/") ||
    path.startsWith("https://tmp/") ||
    path.includes("/tmp/")
  );
}

export async function resolveAvatarLocalPath(
  source?: string
): Promise<string | null> {
  if (!source) return null;

  if (isLocalTempPath(source)) {
    return source;
  }

  if (/^https?:\/\//i.test(source)) {
    const { tempFilePath } = await Taro.downloadFile({ url: source });
    return tempFilePath;
  }

  return source;
}

export async function syncProfileAfterLogin(
  profile?: LoginProfile
): Promise<void> {
  const nickname = profile?.nickname?.trim();
  const updates: { nickname?: string; avatarUrl?: string } = {};

  if (profile?.avatarTempPath) {
    const localPath = await resolveAvatarLocalPath(profile.avatarTempPath);
    if (localPath) {
      const uploaded = await uploadAvatarFile(localPath);
      updates.avatarUrl = uploaded.url;
    }
  }

  if (nickname) {
    updates.nickname = nickname;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await updateProfile(updates);
}

export async function updateUserAvatar(tempPath: string): Promise<void> {
  await syncProfileAfterLogin({ avatarTempPath: tempPath });
}

export async function updateUserNickname(nickname: string): Promise<void> {
  const trimmed = nickname.trim();
  if (!trimmed) return;
  await updateProfile({ nickname: trimmed });
}
