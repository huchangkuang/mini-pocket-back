import {
  classifyList,
  type Accent,
  type CategoryChip,
} from "@/pages/classify/constants";

export type FavoriteCategory = "dev" | "efficiency" | "fun";

export type FavoriteItem = {
  id: string;
  toolId?: number;
  icon: string;
  text: string;
  desc: string;
  path: string;
  accent: Accent;
  tag: string;
  favoriteCategory: FavoriteCategory;
};

export const favoriteFilterChips: CategoryChip[] = [
  { id: "all", label: "全部" },
  { id: "dev", label: "开发工具" },
  { id: "efficiency", label: "效率办公" },
  { id: "fun", label: "趣味生成" },
];

const demoFavoriteConfig: {
  path: string;
  favoriteCategory: FavoriteCategory;
  tag: string;
}[] = [
  {
    path: "/pages/qrcode/index",
    favoriteCategory: "efficiency",
    tag: "PRODUCTIVITY",
  },
  {
    path: "/pages/fingerUp/index",
    favoriteCategory: "fun",
    tag: "ENTERTAINMENT",
  },
  {
    path: "/pages/doDescription/index",
    favoriteCategory: "fun",
    tag: "ENTERTAINMENT",
  },
];

export const demoFavorites: FavoriteItem[] = demoFavoriteConfig.map(
  (cfg, index) => {
    const tool = classifyList.find((item) => item.path === cfg.path)!;
    return {
      id: `demo-${index}`,
      icon: tool.icon,
      text: tool.text,
      desc: tool.desc,
      path: tool.path,
      accent: tool.accent,
      tag: cfg.tag,
      favoriteCategory: cfg.favoriteCategory,
    };
  }
);

export function filterFavorites(
  items: FavoriteItem[],
  query: string,
  chipId: string
): FavoriteItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchChip = chipId === "all" || item.favoriteCategory === chipId;
    const matchSearch =
      !normalizedQuery ||
      item.text.toLowerCase().includes(normalizedQuery) ||
      item.desc.toLowerCase().includes(normalizedQuery);
    return matchChip && matchSearch;
  });
}
