import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/types/auth-user';
import { RecordToolUseDto } from './dto/record-tool-use.dto';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** 记录今日活跃（进入小程序时调用，同一天只计一次） */
  @Post('active-day')
  recordActiveDay(@CurrentUser() user: AuthUser) {
    return this.statsService.recordActiveDay(user.id);
  }

  /** 记录工具使用（点击工具进入时调用） */
  @Post('tool-use')
  recordToolUse(
    @CurrentUser() user: AuthUser,
    @Body() dto: RecordToolUseDto,
  ) {
    return this.statsService.recordToolUse(user.id, dto);
  }
}
