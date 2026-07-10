import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user";
import { GamesService } from "./games.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { SubmitGuessDto } from "./dto/submit-guess.dto";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createGame(@CurrentUser() user: AuthUser, @Body() dto: CreateGameDto) {
    return this.gamesService.createGame(user.id, dto.targetNumber);
  }

  @Get(":gameId")
  @UseGuards(JwtAuthGuard)
  getGameInfo(@CurrentUser() user: AuthUser, @Param("gameId") gameId: string) {
    return this.gamesService.getGameInfo(gameId, user.id);
  }

  @Post(":gameId/guess")
  @UseGuards(JwtAuthGuard)
  submitGuess(
    @CurrentUser() user: AuthUser,
    @Param("gameId") gameId: string,
    @Body() dto: SubmitGuessDto,
  ) {
    return this.gamesService.submitGuess(gameId, user.id, dto.guess);
  }
}
