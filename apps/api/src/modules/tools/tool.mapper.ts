import { Category, Tool } from '@prisma/client';
import { formatHeatScore } from '../../common/utils/heat.util';

export type ToolWithCategory = Tool & { category: Category };

export function mapTool(
  tool: ToolWithCategory,
  options?: { isFavorite?: boolean },
) {
  return {
    id: tool.id,
    routePath: tool.routePath,
    name: tool.name,
    description: tool.description,
    iconKey: tool.iconKey,
    accent: tool.accent,
    category: {
      code: tool.category.code,
      label: tool.category.label,
    },
    heat: formatHeatScore(tool.heatScore),
    heatScore: tool.heatScore,
    isFavorite: options?.isFavorite ?? false,
  };
}
