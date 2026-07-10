import { useCallback, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import type { ToolItem } from "@/pages/classify/constants";
import type { FavoriteItem } from "@/pages/favorites/constants";
import { toggleFavorite as toggleFavoriteApi } from "@/services/favoritesApi";
import { isLoggedIn } from "@/utils/authStore";
import { useAuth } from "@/hooks/useAuth";
import { errorToast } from "@/utils/errorToast";

export function useFavorites(options?: {
  onToolFavoriteChange?: (path: string, isFavorite: boolean) => void;
}) {
  const { isLoggedIn: loggedIn, isReady } = useAuth();
  const [favoritePaths, setFavoritePaths] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [toggling, setToggling] = useState(false);

  const syncFavoritePathsFromTools = useCallback((tools: ToolItem[]) => {
    const paths = new Set(tools.filter((tool) => tool.isFavorite).map((tool) => tool.path));
    setFavoritePaths(paths);
  }, []);

  const isFavorite = useCallback((path: string) => favoritePaths.has(path), [favoritePaths]);

  const toggleFavorite = useCallback(
    async (tool: ToolItem) => {
      if (!isReady) {
        errorToast("正在登录，请稍后再试");
        return null;
      }

      if (!loggedIn && !isLoggedIn()) {
        errorToast("登录失败，请稍后重试");
        return null;
      }

      if (toggling) return null;
      setToggling(true);

      try {
        const result = await toggleFavoriteApi(tool.path);
        setFavoritePaths((prev) => {
          const next = new Set(prev);
          if (result.isFavorite) {
            next.add(tool.path);
          } else {
            next.delete(tool.path);
          }
          return next;
        });
        options?.onToolFavoriteChange?.(tool.path, result.isFavorite);
        return result.isFavorite;
      } catch (e) {
        errorToast(e instanceof Error ? e.message : "操作失败");
        return null;
      } finally {
        setToggling(false);
      }
    },
    [loggedIn, isReady, toggling, options],
  );

  const setFavoritesList = useCallback((items: FavoriteItem[]) => {
    setFavorites(items);
    setFavoritePaths(new Set(items.map((item) => item.path)));
  }, []);

  useDidShow(() => {
    if (!loggedIn) {
      setFavoritePaths(new Set());
      setFavorites([]);
    }
  });

  return {
    favorites,
    favoritePaths,
    isFavorite,
    toggleFavorite,
    setFavoritesList,
    syncFavoritePathsFromTools,
    setFavoritePaths,
  };
}
