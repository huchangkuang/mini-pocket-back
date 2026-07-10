import type { ToolItem } from "@/pages/classify/constants";
import type {
  FavoriteCategory,
  FavoriteItem,
} from "@/pages/favorites/constants";
import { mapApiFavoriteToFavoriteItem } from "@/utils/toolMapper";
import type { ApiFavorite } from "@/types/api";

export function apiFavoritesToItems(items: ApiFavorite[]): FavoriteItem[] {
  return items.map(mapApiFavoriteToFavoriteItem);
}

export function categoryToFavoriteCategory(
  category?: string
): FavoriteCategory {
  if (category === "efficiency") return "efficiency";
  if (category === "dev") return "dev";
  return "fun";
}

export function toolToFavoriteItem(tool: ToolItem): FavoriteItem {
  const favoriteCategory = categoryToFavoriteCategory(tool.category);
  const tagMap: Record<FavoriteCategory, string> = {
    dev: "DEVELOPMENT",
    efficiency: "PRODUCTIVITY",
    fun: "ENTERTAINMENT",
  };
  return {
    id: String(tool.id ?? tool.path),
    toolId: tool.id,
    icon: tool.icon,
    text: tool.text,
    desc: tool.desc,
    path: tool.path,
    accent: tool.accent,
    tag: tagMap[favoriteCategory],
    favoriteCategory,
  };
}
