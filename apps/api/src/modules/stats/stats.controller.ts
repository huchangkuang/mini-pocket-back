import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user";
import { RecordToolUseDto } from "./dto/record-tool-use.dto";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** 记录今日活跃（进入小程序时调用，同一天只计一次） */
  @Post("active-day")
  @UseGuards(JwtAuthGuard)
  recordActiveDay(@CurrentUser() user: AuthUser) {
    return this.statsService.recordActiveDay(user.id);
  }

  /**
   * 打开工具：始终加热度；已登录时额外记录个人使用与 XP。
   * 路径保持不变，兼容未发版的前端。
   */
  @Post("tool-use")
  @UseGuards(OptionalJwtAuthGuard)
  recordToolUse(@Body() dto: RecordToolUseDto, @Req() request: Request & { user?: AuthUser }) {
    return this.statsService.recordOpen(dto, request.user?.id);
  }
}
