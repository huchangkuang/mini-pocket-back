import { useCallback, useEffect, useRef, useState } from "react";
import { showToast, useDidShow } from "@tarojs/taro";
import type { CategoryChip, ToolItem } from "@/pages/classify/constants";
import {
  categoryChips as fallbackCategoryChips,
  classifyList,
  excludeClassifyList,
} from "@/pages/classify/constants";
import { listCategories } from "@/services/categoriesApi";
import { listTools } from "@/services/toolsApi";
import { mapApiToolToToolItem } from "@/utils/toolMapper";
import { useDebounce } from "@/hooks/useDebounce";

function getFallbackTools(sortByHeatDesc: boolean): ToolItem[] {
  const items = classifyList.filter((item) => !excludeClassifyList.includes(item.path));
  return [...items].sort((a, b) =>
    sortByHeatDesc ? b.heatRank - a.heatRank : a.heatRank - b.heatRank,
  );
}

export function useTools(selectedCategory: string, searchQuery: string, sortByHeatDesc: boolean) {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>(fallbackCategoryChips);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState(searchQuery);
  const skipNextFilterFetch = useRef(true);

  const debouncedSetKeyword = useDebounce((value: string) => {
    setDebouncedKeyword(value);
  }, 300);

  useEffect(() => {
    debouncedSetKeyword(searchQuery);
  }, [searchQuery, debouncedSetKeyword]);

  useEffect(() => {
    // 分类列表同样无需登录
    listCategories()
      .then((categories) => {
        setCategoryChips([
          { id: "all", label: "全部" },
          ...categories.map((item) => ({ id: item.code, label: item.label })),
        ]);
      })
      .catch(() => {
        setCategoryChips(fallbackCategoryChips);
      });
  }, []);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listTools({
        category: selectedCategory,
        keyword: debouncedKeyword,
        sort: "heat",
        order: sortByHeatDesc ? "desc" : "asc",
      });
      setTools(result.list.map(mapApiToolToToolItem));
      setUsingFallback(false);
    } catch {
      setTools(getFallbackTools(sortByHeatDesc));
      setUsingFallback(true);
      showToast({
        icon: "none",
        title: "网络异常，已加载本地数据",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedKeyword, sortByHeatDesc]);

  // 工具列表无登录门槛：页面每次 show 拉一次
  useDidShow(() => {
    void fetchTools();
  });

  // 筛选/搜索/排序变化时再拉；首轮由 useDidShow 负责，避免重复请求
  useEffect(() => {
    if (skipNextFilterFetch.current) {
      skipNextFilterFetch.current = false;
      return;
    }
    void fetchTools();
  }, [fetchTools]);

  const updateToolFavorite = useCallback((path: string, isFavorite: boolean) => {
    setTools((prev) => prev.map((tool) => (tool.path === path ? { ...tool, isFavorite } : tool)));
  }, []);

  return {
    tools,
    categoryChips,
    loading,
    usingFallback,
    refreshTools: fetchTools,
    updateToolFavorite,
  };
}
