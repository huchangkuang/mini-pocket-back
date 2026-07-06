import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryToolsDto } from './dto/query-tools.dto';
import { mapTool } from './tool.mapper';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryToolsDto, userId?: number) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.ToolWhereInput = {
      enabled: true,
    };

    if (query.category && query.category !== 'all') {
      where.category = { code: query.category };
    }

    const keyword = query.keyword?.trim();
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const orderBy: Prisma.ToolOrderByWithRelationInput[] =
      query.sort === 'heat'
        ? [{ heatScore: 'desc' }, { sortOrder: 'asc' }]
        : [{ sortOrder: 'asc' }];

    const [total, tools] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const favoriteToolIds = userId
      ? await this.getFavoriteToolIdSet(userId, tools.map((tool) => tool.id))
      : new Set<number>();

    return {
      list: tools.map((tool) =>
        mapTool(tool, { isFavorite: favoriteToolIds.has(tool.id) }),
      ),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number, userId?: number) {
    const tool = await this.prisma.tool.findFirst({
      where: { id, enabled: true },
      include: { category: true },
    });

    if (!tool) {
      throw new NotFoundException('工具不存在');
    }

    let isFavorite = false;
    if (userId) {
      const favorite = await this.prisma.userFavorite.findUnique({
        where: {
          userId_toolId: {
            userId,
            toolId: tool.id,
          },
        },
      });
      isFavorite = Boolean(favorite);
    }

    return mapTool(tool, { isFavorite });
  }

  private async getFavoriteToolIdSet(userId: number, toolIds: number[]) {
    if (toolIds.length === 0) {
      return new Set<number>();
    }

    const favorites = await this.prisma.userFavorite.findMany({
      where: {
        userId,
        toolId: { in: toolIds },
      },
      select: { toolId: true },
    });

    return new Set(favorites.map((item) => item.toolId));
  }
}
