import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { mapDecision, mapDecisionSummary, normalizeOptions } from "./decision.mapper";
import { DecisionBodyDto, UpdateDecisionDto } from "./dto/decision.dto";

const DEFAULT_DECISION = {
  title: "今晚吃什么？",
  options: ["火锅", "披萨", "寿司", "烤肉", "面条", "沙拉"],
};

@Injectable()
export class DecisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDecisions(userId: number) {
    await this.ensureDefaultDecision(userId);

    const list = await this.prisma.userDecision.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { lastUsedAt: "desc" }, { id: "desc" }],
    });

    const current = list.find((item) => item.isActive);
    if (!current) {
      throw new NotFoundException("当前决策不存在");
    }

    return {
      current: mapDecisionSummary(current),
      list: list.map(mapDecisionSummary),
    };
  }

  async create(userId: number, dto: DecisionBodyDto) {
    const options = this.parseOptions(dto.options);
    const now = new Date();

    const decision = await this.prisma.$transaction(async (tx) => {
      await tx.userDecision.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      return tx.userDecision.create({
        data: {
          userId,
          title: dto.title.trim(),
          options,
          isActive: true,
          lastUsedAt: now,
        },
      });
    });

    return mapDecision(decision);
  }

  async update(userId: number, id: number, dto: UpdateDecisionDto) {
    const decision = await this.findOwnedDecision(userId, id);
    const data = this.buildUpdateData(dto, decision.options as string[]);

    const updated = await this.prisma.userDecision.update({
      where: { id: decision.id },
      data,
    });

    return mapDecision(updated);
  }

  async updateCurrent(userId: number, dto: UpdateDecisionDto) {
    const current = await this.findActiveDecision(userId);
    const data = this.buildUpdateData(dto, current.options as string[]);

    const updated = await this.prisma.userDecision.update({
      where: { id: current.id },
      data,
    });

    return mapDecision(updated);
  }

  async activate(userId: number, id: number) {
    const decision = await this.findOwnedDecision(userId, id);
    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.userDecision.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      return tx.userDecision.update({
        where: { id: decision.id },
        data: {
          isActive: true,
          lastUsedAt: now,
        },
      });
    });

    return mapDecision(updated);
  }

  async remove(userId: number, id: number) {
    const decision = await this.findOwnedDecision(userId, id);
    const wasActive = decision.isActive;

    await this.prisma.userDecision.delete({
      where: { id: decision.id },
    });

    if (!wasActive) {
      return { removed: true };
    }

    const remaining = await this.prisma.userDecision.findMany({
      where: { userId },
      orderBy: [{ lastUsedAt: "desc" }, { id: "desc" }],
      take: 1,
    });

    if (remaining.length > 0) {
      await this.prisma.userDecision.update({
        where: { id: remaining[0].id },
        data: { isActive: true, lastUsedAt: new Date() },
      });
    } else {
      await this.createDefaultDecision(userId);
    }

    return { removed: true };
  }

  private async ensureDefaultDecision(userId: number) {
    const count = await this.prisma.userDecision.count({ where: { userId } });
    if (count === 0) {
      await this.createDefaultDecision(userId);
    }

    const activeCount = await this.prisma.userDecision.count({
      where: { userId, isActive: true },
    });

    if (activeCount === 0) {
      const latest = await this.prisma.userDecision.findFirst({
        where: { userId },
        orderBy: [{ lastUsedAt: "desc" }, { id: "desc" }],
      });

      if (latest) {
        await this.prisma.userDecision.update({
          where: { id: latest.id },
          data: { isActive: true, lastUsedAt: new Date() },
        });
      }
    }
  }

  private async createDefaultDecision(userId: number) {
    const now = new Date();
    await this.prisma.userDecision.create({
      data: {
        userId,
        title: DEFAULT_DECISION.title,
        options: DEFAULT_DECISION.options,
        isActive: true,
        lastUsedAt: now,
      },
    });
  }

  private buildUpdateData(dto: UpdateDecisionDto, currentOptions: string[]) {
    const data: {
      title?: string;
      options?: string[];
    } = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.options !== undefined) {
      data.options = this.parseOptions(dto.options);
    } else if (dto.title !== undefined && currentOptions.length < 2) {
      throw new BadRequestException("至少填写两个选项");
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException("没有可更新的内容");
    }

    return data;
  }

  private parseOptions(options: string[]) {
    const normalized = normalizeOptions(options);
    if (normalized.length < 2) {
      throw new BadRequestException("至少填写两个选项");
    }
    return normalized;
  }

  private async findOwnedDecision(userId: number, id: number) {
    const decision = await this.prisma.userDecision.findFirst({
      where: { id, userId },
    });

    if (!decision) {
      throw new NotFoundException("决策不存在");
    }

    return decision;
  }

  private async findActiveDecision(userId: number) {
    await this.ensureDefaultDecision(userId);

    const decision = await this.prisma.userDecision.findFirst({
      where: { userId, isActive: true },
    });

    if (!decision) {
      throw new NotFoundException("当前决策不存在");
    }

    return decision;
  }
}
