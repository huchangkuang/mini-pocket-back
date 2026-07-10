import type { ApiFavorite, ApiTool } from "@/types/api";
import type { ToolItem } from "@/pages/classify/constants";
import type { FavoriteItem } from "@/pages/favorites/constants";
import { resolveIconKey } from "@/utils/iconMap";

export function mapApiToolToToolItem(tool: ApiTool): ToolItem {
  return {
    id: tool.id,
    icon: resolveIconKey(tool.iconKey),
    text: tool.name,
    desc: tool.description,
    path: tool.routePath,
    accent: tool.accent,
    category: tool.category.code,
    categoryLabel: tool.category.label,
    heat: tool.heat,
    heatRank: tool.heatScore,
    isFavorite: tool.isFavorite,
  };
}

export function mapApiFavoriteToFavoriteItem(item: ApiFavorite): FavoriteItem {
  return {
    id: String(item.id),
    toolId: item.id,
    icon: resolveIconKey(item.iconKey),
    text: item.name,
    desc: item.description,
    path: item.routePath,
    accent: item.accent,
    tag: item.tag,
    favoriteCategory: item.favoriteCategory,
  };
}
