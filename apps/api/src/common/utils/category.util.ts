export type FavoriteCategory = 'dev' | 'efficiency' | 'fun';

const TAG_MAP: Record<FavoriteCategory, string> = {
  dev: 'DEVELOPMENT',
  efficiency: 'PRODUCTIVITY',
  fun: 'ENTERTAINMENT',
};

export function toFavoriteCategory(categoryCode: string): FavoriteCategory {
  if (categoryCode === 'efficiency') return 'efficiency';
  if (categoryCode === 'dev') return 'dev';
  return 'fun';
}

export function toFavoriteTag(categoryCode: string): string {
  return TAG_MAP[toFavoriteCategory(categoryCode)];
}
