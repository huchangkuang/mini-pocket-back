import { useMemo } from "react";
import { useDidShow } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import type { TabKey } from "@/components/bottomNav";

type CustomTabBar = {
  setSelected: (key: TabKey) => void;
};

export function useTabBarSelected(key: TabKey) {
  const page = useMemo(() => Taro.getCurrentInstance().page, []);

  useDidShow(() => {
    if (!page) return;
    const tabBar = Taro.getTabBar<CustomTabBar>(page);
    tabBar?.setSelected?.(key);
  });
}
