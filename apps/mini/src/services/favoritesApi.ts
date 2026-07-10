import type {
  ApiFavorite,
  ApiFavoritesList,
  ApiToggleFavoriteResult,
  ListFavoritesQuery,
} from "@/types/api";
import { del, get, post } from "@/utils/request";

export function listFavorites(query: ListFavoritesQuery = {}): Promise<ApiFavoritesList> {
  const params: Record<string, string | undefined> = {};
  if (query.category && query.category !== "all") {
    params.category = query.category;
  }
  if (query.keyword?.trim()) {
    params.keyword = query.keyword.trim();
  }
  return get<ApiFavoritesList>("/favorites", params);
}

export function toggleFavorite(routePath: string): Promise<ApiToggleFavoriteResult> {
  return post<ApiToggleFavoriteResult>("/favorites/toggle", { routePath });
}

export function removeFavorite(toolId: number): Promise<{ removed: boolean }> {
  return del<{ removed: boolean }>(`/favorites/${toolId}`);
}

export type { ApiFavorite };
