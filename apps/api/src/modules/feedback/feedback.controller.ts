import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/types/auth-user';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(user.id, dto);
  }
}
