import { Injectable } from "@nestjs/common";
import { FeedbackType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        type: dto.type as FeedbackType,
        content: dto.content.trim(),
        contact: dto.contact?.trim() || null,
        imageUrls: dto.imageUrls ?? [],
      },
    });

    return {
      id: feedback.id,
      createdAt: feedback.createdAt.toISOString(),
    };
  }
}
