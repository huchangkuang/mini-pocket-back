import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user";
import { FavoriteActionDto, QueryFavoritesDto } from "./dto/favorite.dto";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: QueryFavoritesDto) {
    return this.favoritesService.list(user.id, query);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: FavoriteActionDto) {
    return this.favoritesService.add(user.id, dto);
  }

  @Post("toggle")
  toggle(@CurrentUser() user: AuthUser, @Body() dto: FavoriteActionDto) {
    return this.favoritesService.toggle(user.id, dto);
  }

  @Delete(":toolId")
  remove(@CurrentUser() user: AuthUser, @Param("toolId", ParseIntPipe) toolId: number) {
    return this.favoritesService.remove(user.id, { toolId });
  }
}
