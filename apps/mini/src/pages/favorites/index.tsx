import React, { useCallback, useEffect, useMemo, useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { ScrollView, View, Text } from "@tarojs/components";
import FavoritesTopBar from "@/components/favoritesTopBar";
import CategoryChips from "@/components/categoryChips";
import SearchBar from "@/components/searchBar";
import FavoriteCard from "@/components/favoriteCard";
import FavoritesEmpty from "@/components/favoritesEmpty";
import { errorToast } from "@/utils/errorToast";
import { openToolPage } from "@/utils/statsSync";
import { useTabBarSelected } from "@/utils/useTabBarSelected";
import { useAuth } from "@/hooks/useAuth";
import { listFavorites, removeFavorite } from "@/services/favoritesApi";
import { apiFavoritesToItems } from "@/utils/favoritesStore";
import {
  favoriteFilterChips,
  filterFavorites,
  type FavoriteItem,
} from "@/pages/favorites/constants";
import "./index.scss";

const PLACEHOLDER_MSG = "更多功能正在开发中...";

const Favorites: React.FC = () => {
  useTabBarSelected("favorites");
  const { isLoggedIn, isReady, loggingIn, login } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChip, setSelectedChip] = useState("all");

  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const result = await listFavorites();
      setFavorites(apiFavoritesToItems(result.list));
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "加载收藏失败");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useDidShow(() => {
    if (isReady) {
      loadFavorites();
    }
  });

  useEffect(() => {
    if (isReady) {
      loadFavorites();
    }
  }, [isReady, isLoggedIn, loadFavorites]);

  const filteredFavorites = useMemo(
    () => filterFavorites(favorites, searchQuery, selectedChip),
    [favorites, searchQuery, selectedChip]
  );

  const viewToPage = (path: string, toolId?: number) => {
    openToolPage(path, toolId);
  };

  const removeFavoriteItem = async (item: FavoriteItem) => {
    if (!item.toolId) return;
    try {
      await removeFavorite(item.toolId);
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "取消收藏失败");
    }
  };

  const handleLogin = async () => {
    const ok = await login();
    if (ok) {
      await loadFavorites();
    }
  };

  if (!isReady) {
    return <View className="favoritesPage" />;
  }

  if (!isLoggedIn) {
    return (
      <View className="favoritesPage">
        <FavoritesTopBar onFilter={() => errorToast(PLACEHOLDER_MSG)} />
        <View className="favoritesPage__emptyWrap">
          <FavoritesEmpty
            variant="guest"
            onLogin={handleLogin}
            loading={loggingIn}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="favoritesPage">
      <FavoritesTopBar onFilter={() => errorToast(PLACEHOLDER_MSG)} />

      {favorites.length === 0 && !loading ? (
        <View className="favoritesPage__emptyWrap">
          <FavoritesEmpty />
        </View>
      ) : (
        <ScrollView scrollY enhanced className="favoritesPage__scroll">
          <View className="favoritesPage__content">
            <SearchBar
              value={searchQuery}
              placeholder="搜索我的收藏工具..."
              onChange={setSearchQuery}
            />

            <CategoryChips
              chips={favoriteFilterChips}
              selectedId={selectedChip}
              onSelect={setSelectedChip}
            />

            <View className="favoritesPage__list">
              {filteredFavorites.length === 0 ? (
                <View className="favoritesPage__noResults">
                  <Text>无匹配的收藏工具</Text>
                </View>
              ) : (
                filteredFavorites.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    icon={item.icon}
                    title={item.text}
                    desc={item.desc}
                    tag={item.tag}
                    accent={item.accent}
                    onClick={() => viewToPage(item.path, item.toolId)}
                    onUnfavorite={() => removeFavoriteItem(item)}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Favorites;
