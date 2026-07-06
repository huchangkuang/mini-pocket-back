import { ToolWithCategory } from '../tools/tool.mapper';
import {
  toFavoriteCategory,
  toFavoriteTag,
} from '../../common/utils/category.util';

export function mapFavorite(tool: ToolWithCategory) {
  const favoriteCategory = toFavoriteCategory(tool.category.code);

  return {
    id: tool.id,
    routePath: tool.routePath,
    name: tool.name,
    description: tool.description,
    iconKey: tool.iconKey,
    accent: tool.accent,
    tag: toFavoriteTag(tool.category.code),
    favoriteCategory,
    category: {
      code: tool.category.code,
      label: tool.category.label,
    },
  };
}
