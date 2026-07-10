import Taro from "@tarojs/taro";
import type {
  ApiPersistStorageResult,
  ApiResponse,
  ApiUploadResult,
  PersistScope,
} from "@/types/api";
import { getToken } from "@/utils/authStore";
import { ApiError } from "@/utils/request";
import { post } from "@/utils/request";

async function uploadFileTo(path: "avatar" | "upload", filePath: string): Promise<ApiUploadResult> {
  const token = getToken();
  if (!token) {
    throw new ApiError("请先登录", 401);
  }

  const base = API_BASE_URL.replace(/\/$/, "");
  const response = await Taro.uploadFile({
    url: `${base}/storage/${path}`,
    filePath,
    name: "file",
    header: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode === 401) {
    throw new ApiError("登录已失效，请重新登录", 401);
  }

  let body: ApiResponse<ApiUploadResult>;
  try {
    body = JSON.parse(response.data) as ApiResponse<ApiUploadResult>;
  } catch {
    throw new ApiError("上传响应解析失败", response.statusCode);
  }

  if (response.statusCode < 200 || response.statusCode >= 300 || body.code !== 0) {
    throw new ApiError(body?.message || "上传失败", response.statusCode);
  }

  return body.data;
}

/** 头像直传永久目录 avatars/{userId}/ */
export function uploadAvatarFile(filePath: string): Promise<ApiUploadResult> {
  return uploadFileTo("avatar", filePath);
}

/** 临时上传至 temp/{userId}/，供反馈等场景 */
export function uploadTempFile(filePath: string): Promise<ApiUploadResult> {
  return uploadFileTo("upload", filePath);
}

/** 保存时将 temp 文件复制到永久目录 */
export function persistStorageFiles(
  ossKeys: string[],
  scope: PersistScope = "general",
): Promise<ApiPersistStorageResult> {
  return post<ApiPersistStorageResult>("/storage/persist", { ossKeys, scope });
}
