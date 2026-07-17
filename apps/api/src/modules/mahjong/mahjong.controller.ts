import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user";
import { JoinBySceneDto, SaveDraftDto, UpdateRoundDto } from "./dto/mahjong.dto";
import { MahjongService } from "./mahjong.service";

@Controller("mahjong")
@UseGuards(JwtAuthGuard)
export class MahjongController {
  constructor(private readonly mahjongService: MahjongService) {}

  @Post("sessions")
  createSession(@CurrentUser() user: AuthUser) {
    return this.mahjongService.createSession(user.id);
  }

  @Get("sessions")
  listMySessions(@CurrentUser() user: AuthUser) {
    return this.mahjongService.listMySessions(user.id);
  }

  @Post("sessions/join-by-scene")
  joinByScene(@CurrentUser() user: AuthUser, @Body() dto: JoinBySceneDto) {
    return this.mahjongService.joinByScene(dto.scene, user.id);
  }

  @Get("sessions/:sessionId")
  getSnapshot(@CurrentUser() user: AuthUser, @Param("sessionId") sessionId: string) {
    return this.mahjongService.getSnapshot(sessionId, user.id);
  }

  @Post("sessions/:sessionId/join")
  joinSession(@CurrentUser() user: AuthUser, @Param("sessionId") sessionId: string) {
    return this.mahjongService.joinSession(sessionId, user.id);
  }

  @Patch("sessions/:sessionId/draft")
  saveDraft(
    @CurrentUser() user: AuthUser,
    @Param("sessionId") sessionId: string,
    @Body() dto: SaveDraftDto,
  ) {
    return this.mahjongService.saveDraft(sessionId, user.id, dto.scores);
  }

  @Patch("sessions/:sessionId/rounds/:roundId")
  updateRound(
    @CurrentUser() user: AuthUser,
    @Param("sessionId") sessionId: string,
    @Param("roundId") roundId: string,
    @Body() dto: UpdateRoundDto,
  ) {
    return this.mahjongService.updateRound(sessionId, Number(roundId), user.id, dto.scores);
  }

  @Post("sessions/:sessionId/end")
  endSession(@CurrentUser() user: AuthUser, @Param("sessionId") sessionId: string) {
    return this.mahjongService.endSession(sessionId, user.id);
  }

  @Get("sessions/:sessionId/wxacode")
  getWxacode(@CurrentUser() user: AuthUser, @Param("sessionId") sessionId: string) {
    return this.mahjongService.getWxacode(sessionId, user.id);
  }

  @Get("invite/:scene")
  resolveScene(@CurrentUser() _user: AuthUser, @Param("scene") scene: string) {
    return this.mahjongService.resolveScene(scene);
  }
}
