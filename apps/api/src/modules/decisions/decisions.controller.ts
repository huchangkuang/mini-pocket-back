import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/types/auth-user';
import { DecisionsService } from './decisions.service';
import { DecisionBodyDto, UpdateDecisionDto } from './dto/decision.dto';

@Controller('decisions')
@UseGuards(JwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.decisionsService.getDecisions(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: DecisionBodyDto) {
    return this.decisionsService.create(user.id, dto);
  }

  @Patch('current')
  updateCurrent(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateDecisionDto,
  ) {
    return this.decisionsService.updateCurrent(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDecisionDto,
  ) {
    return this.decisionsService.update(user.id, id, dto);
  }

  @Post(':id/activate')
  activate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.decisionsService.activate(user.id, id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.decisionsService.remove(user.id, id);
  }
}
