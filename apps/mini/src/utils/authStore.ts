import {
  getStorageSync,
  removeStorageSync,
  setStorageSync,
} from "@tarojs/taro";
import type { ApiUserLevel, ApiUserMe, ApiUserStats } from "@/types/api";

const TOKEN_KEY = "mini_pocket_auth_token";
const USER_KEY = "mini_pocket_user";

type Listener = () => void;

let cachedUser: ApiUserMe | null = readStoredUser();
let sessionReady = false;
const listeners = new Set<Listener>();

function readStoredUser(): ApiUserMe | null {
  try {
    const stored = getStorageSync(USER_KEY) as ApiUserMe | undefined;
    return stored ?? null;
  } catch {
    return null;
  }
}

export function getToken(): string {
  try {
    return (getStorageSync(TOKEN_KEY) as string) || "";
  } catch {
    return "";
  }
}

export function setToken(token: string): void {
  setStorageSync(TOKEN_KEY, token);
  notify();
}

export function clearAuth(): void {
  removeStorageSync(TOKEN_KEY);
  removeStorageSync(USER_KEY);
  cachedUser = null;
  notify();
}

export function getUser(): ApiUserMe | null {
  return cachedUser;
}

export function setUser(user: ApiUserMe): void {
  cachedUser = user;
  setStorageSync(USER_KEY, user);
  notify();
}

export function updateUserStats(stats: ApiUserStats): void {
  if (!cachedUser) return;
  cachedUser = { ...cachedUser, stats };
  setStorageSync(USER_KEY, cachedUser);
  notify();
}

export function updateUserProgress(
  stats: ApiUserStats,
  level: ApiUserLevel
): void {
  if (!cachedUser) return;
  cachedUser = { ...cachedUser, stats, level };
  setStorageSync(USER_KEY, cachedUser);
  notify();
}

/** 以本地 token 为准；用户信息可由 restoreSession 异步刷新 */
export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

export function isSessionReady(): boolean {
  return sessionReady;
}

export function setSessionReady(ready: boolean): void {
  sessionReady = ready;
  notify();
}

export function hydrateUserFromStorage(): void {
  cachedUser = readStoredUser();
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((listener) => listener());
}
