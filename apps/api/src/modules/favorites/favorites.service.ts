import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { FavoriteActionDto, QueryFavoritesDto } from "./dto/favorite.dto";
import { mapFavorite } from "./favorite.mapper";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, query: QueryFavoritesDto) {
    const favorites = await this.prisma.userFavorite.findMany({
      where: { userId },
      include: {
        tool: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let items = favorites.filter((item) => item.tool.enabled).map((item) => mapFavorite(item.tool));

    if (query.category && query.category !== "all") {
      items = items.filter((item) => item.favoriteCategory === query.category);
    }

    const keyword = query.keyword?.trim().toLowerCase();
    if (keyword) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword),
      );
    }

    return {
      list: items,
      total: items.length,
    };
  }

  async add(userId: number, dto: FavoriteActionDto) {
    const tool = await this.resolveTool(dto);
    await this.prisma.userFavorite.upsert({
      where: {
        userId_toolId: {
          userId,
          toolId: tool.id,
        },
      },
      update: {},
      create: {
        userId,
        toolId: tool.id,
      },
    });

    return mapFavorite(tool);
  }

  async remove(userId: number, dto: FavoriteActionDto) {
    const tool = await this.resolveTool(dto);
    await this.prisma.userFavorite.deleteMany({
      where: {
        userId,
        toolId: tool.id,
      },
    });

    return { removed: true };
  }

  async toggle(userId: number, dto: FavoriteActionDto) {
    const tool = await this.resolveTool(dto);
    const existing = await this.prisma.userFavorite.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId: tool.id,
        },
      },
    });

    if (existing) {
      await this.prisma.userFavorite.delete({ where: { id: existing.id } });
      return {
        isFavorite: false,
        item: null,
      };
    }

    await this.prisma.userFavorite.create({
      data: {
        userId,
        toolId: tool.id,
      },
    });

    return {
      isFavorite: true,
      item: mapFavorite(tool),
    };
  }

  private async resolveTool(dto: FavoriteActionDto) {
    if (!dto.toolId && !dto.routePath) {
      throw new BadRequestException("toolId 或 routePath 必须提供一个");
    }

    const where: Prisma.ToolWhereInput = dto.toolId
      ? { id: dto.toolId, enabled: true }
      : { routePath: dto.routePath, enabled: true };

    const tool = await this.prisma.tool.findFirst({
      where,
      include: { category: true },
    });

    if (!tool) {
      throw new NotFoundException("工具不存在");
    }

    return tool;
  }
}
