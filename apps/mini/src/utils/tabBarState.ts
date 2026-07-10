import Taro from "@tarojs/taro";
import type { TabKey } from "@/components/bottomNav";

const ROUTE_TO_KEY: Record<string, TabKey> = {
  "pages/classify/index": "workshop",
  "pages/favorites/index": "favorites",
  "pages/mine/index": "mine",
};

export function getActiveKeyFromRoute(): TabKey {
  const pages = Taro.getCurrentPages();
  const route = pages[pages.length - 1]?.route ?? "";
  return ROUTE_TO_KEY[route] ?? "workshop";
}
