import type { Accent } from "./tools";

export type FavoriteCategory = "dev" | "efficiency" | "fun";

export type ApiFavorite = {
  id: number;
  routePath: string;
  name: string;
  description: string;
  iconKey: string;
  accent: Accent;
  tag: string;
  favoriteCategory: FavoriteCategory;
  category: {
    code: string;
    label: string;
  };
};

export type ApiFavoritesList = {
  list: ApiFavorite[];
  total: number;
};

export type ApiToggleFavoriteResult = {
  isFavorite: boolean;
  item: ApiFavorite | null;
};

export type ListFavoritesQuery = {
  category?: string;
  keyword?: string;
};
