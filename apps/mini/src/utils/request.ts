import Taro from "@tarojs/taro";
import type { ApiResponse } from "@/types/api";
import { clearAuth, getToken } from "@/utils/authStore";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: RequestMethod;
  data?: Record<string, unknown>;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 0) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | undefined>
) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${base}${normalizedPath}`;

  if (query) {
    const params = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join("&");
    if (params) url += `?${params}`;
  }

  return url;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", data, auth = true, query } = options;
  const header: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
  }

  const response = await Taro.request<ApiResponse<T>>({
    url: buildUrl(path, query),
    method,
    data,
    header,
  }).catch(() => {
    throw new ApiError("网络连接失败，请确认后端已启动且地址正确", 0);
  });

  const statusCode = response.statusCode;
  const body = response.data;

  if (statusCode === 401) {
    clearAuth();
    throw new ApiError("登录已失效，请重新登录", 401);
  }

  if (statusCode < 200 || statusCode >= 300) {
    const message =
      typeof body?.message === "string" ? body.message : "请求失败";
    throw new ApiError(message, statusCode);
  }

  if (!body || body.code !== 0) {
    throw new ApiError(body?.message || "请求失败", body?.code ?? statusCode);
  }

  return body.data;
}

export function get<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
  auth = true
): Promise<T> {
  return request<T>(path, { method: "GET", query, auth });
}

export function post<T>(
  path: string,
  data?: Record<string, unknown>,
  auth = true
): Promise<T> {
  return request<T>(path, { method: "POST", data, auth });
}

export function patch<T>(
  path: string,
  data?: Record<string, unknown>,
  auth = true
): Promise<T> {
  return request<T>(path, { method: "PATCH", data, auth });
}

export function del<T>(path: string, auth = true): Promise<T> {
  return request<T>(path, { method: "DELETE", auth });
}
