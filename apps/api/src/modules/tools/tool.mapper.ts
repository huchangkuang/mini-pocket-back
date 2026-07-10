import { Category, Tool as PrismaTool } from "@prisma/client";
import type { Tool } from "@mini-pocket/shared";
import { formatHeatScore } from "../../common/utils/heat.util";

export type ToolWithCategory = PrismaTool & { category: Category };

export function mapTool(tool: ToolWithCategory, options?: { isFavorite?: boolean }): Tool {
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
