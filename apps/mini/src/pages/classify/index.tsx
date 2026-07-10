import React, { useEffect } from "react";
import { ScrollView, View, Text } from "@tarojs/components";
import Icon from "@/components/Icon";
import cs from "classnames";
import HomeTopBar from "@/components/homeTopBar";
import FeaturedBanner from "@/components/featuredBanner";
import CategoryChips from "@/components/categoryChips";
import SearchBar from "@/components/searchBar";
import ToolCard, { type ToolCardLayout } from "@/components/toolCard";
import { errorToast } from "@/utils/errorToast";
import { openToolPage } from "@/utils/statsSync";
import { useTabBarSelected } from "@/utils/useTabBarSelected";
import { useFavorites } from "@/utils/useFavorites";
import { useTools } from "@/hooks/useTools";
import "./index.scss";

const PLACEHOLDER_MSG = "更多功能正在开发中...";

const Classify: React.FC = () => {
  useTabBarSelected("workshop");

  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortByHeatDesc, setSortByHeatDesc] = React.useState(true);
  const [layoutMode, setLayoutMode] = React.useState<ToolCardLayout>("grid");

  const { tools, categoryChips, updateToolFavorite } = useTools(
    selectedCategory,
    searchQuery,
    sortByHeatDesc,
  );

  const { isFavorite, toggleFavorite, syncFavoritePathsFromTools } = useFavorites({
    onToolFavoriteChange: updateToolFavorite,
  });

  useEffect(() => {
    syncFavoritePathsFromTools(tools);
  }, [tools, syncFavoritePathsFromTools]);

  const viewToPage = (path: string, toolId?: number) => {
    if (!path) {
      errorToast(PLACEHOLDER_MSG);
      return;
    }
    openToolPage(path, toolId);
  };

  const toggleSortByHeat = () => {
    setSortByHeatDesc((prev) => !prev);
  };

  const toggleLayoutMode = () => {
    setLayoutMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const getCategoryTag = (category?: string, categoryLabel?: string) => {
    if (categoryLabel) return categoryLabel.toUpperCase();
    const chip = categoryChips.find((item) => item.id === category);
    return chip?.label.toUpperCase() ?? "";
  };

  return (
    <View className="workshop">
      <HomeTopBar />

      <ScrollView scrollY enhanced className="workshop__scroll">
        <View className="workshop__content">
          <FeaturedBanner />

          <View className="workshop__filters">
            <CategoryChips
              chips={categoryChips}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <SearchBar value={searchQuery} placeholder="搜索工具..." onChange={setSearchQuery} />
          </View>

          <View className="workshop__section">
            <View className="workshop__sectionHeader">
              <Text className="workshop__sectionTitle">全部工具</Text>
              <View className="workshop__sectionActions">
                <View
                  className={cs(
                    "workshop__actionBtn",
                    sortByHeatDesc && "workshop__actionBtn--active",
                  )}
                  onClick={toggleSortByHeat}
                >
                  <Text className="workshop__actionBtnText">热度</Text>
                  {sortByHeatDesc ? (
                    <Icon name="arrow-up" size={12} color="#005ea4" />
                  ) : (
                    <Icon name="arrow-down" size={12} color="#005ea4" />
                  )}
                </View>
                <View className="workshop__actionBtn" onClick={toggleLayoutMode}>
                  <Icon name="arrow-left" size={10} color="#005ea4" />
                  <Text className="workshop__actionBtnText">
                    {layoutMode === "grid" ? "方格" : "列表"}
                  </Text>
                  <Icon name="arrow-right" size={10} color="#005ea4" />
                </View>
              </View>
            </View>

            <View className={cs(layoutMode === "grid" ? "workshop__grid" : "workshop__list")}>
              {tools.map((item) => (
                <ToolCard
                  key={item.path}
                  layout={layoutMode}
                  icon={item.icon}
                  title={item.text}
                  desc={item.desc}
                  accent={item.accent}
                  heat={item.heat}
                  tag={getCategoryTag(item.category, item.categoryLabel)}
                  isFavorite={isFavorite(item.path)}
                  onFavoriteToggle={() => toggleFavorite(item)}
                  onClick={() => viewToPage(item.path, item.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Classify;
