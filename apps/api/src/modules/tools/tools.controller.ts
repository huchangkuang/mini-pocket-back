import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../../common/types/auth-user';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolsService } from './tools.service';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@Query() query: QueryToolsDto, @Req() request: Request & { user?: AuthUser }) {
    return this.toolsService.list(query, request.user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  detail(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request & { user?: AuthUser },
  ) {
    return this.toolsService.findById(id, request.user?.id);
  }
}
