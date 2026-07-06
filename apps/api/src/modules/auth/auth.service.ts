import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/types/auth-user';
import { StatsService } from '../stats/stats.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { WechatService } from './wechat.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatService: WechatService,
    private readonly jwtService: JwtService,
    private readonly statsService: StatsService,
  ) {}

  findUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async loginWithWechat(dto: WechatLoginDto) {
    const session = await this.wechatService.code2Session(dto.code);
    const profileData = {
      ...(dto.nickname !== undefined ? { nickname: dto.nickname } : {}),
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
    };

    const user = await this.prisma.user.upsert({
      where: { openid: session.openid },
      update: {
        unionid: session.unionid ?? undefined,
        ...profileData,
      },
      create: {
        openid: session.openid,
        unionid: session.unionid,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
      },
    });

    const token = await this.signToken(user);
    return {
      token,
      user: this.toUserProfile(user),
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.nickname !== undefined ? { nickname: dto.nickname } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
    });

    return this.toUserProfile(user);
  }

  async getProfile(userId: number) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const stats = await this.statsService.getUserStats(userId);

    return {
      ...this.toUserProfile(user),
      stats,
    };
  }

  private signToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      openid: user.openid,
    };
    return this.jwtService.signAsync(payload);
  }

  private toUserProfile(user: User) {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      joinDate: this.formatJoinDate(user.createdAt),
    };
  }

  private formatJoinDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }
}
