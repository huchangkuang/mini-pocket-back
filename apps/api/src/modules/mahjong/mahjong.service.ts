import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MahjongRoundStatus, MahjongSessionStatus } from "@prisma/client";
import type {
  ApiMahjongRound,
  ApiMahjongSaveDraftResult,
  ApiMahjongSessionList,
  ApiMahjongSessionSnapshot,
  ApiMahjongWxacodeResult,
} from "@mini-pocket/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { WechatService } from "../auth/wechat.service";
import {
  areAllSeatsFilled,
  generateDisplayCode,
  generateInviteScene,
  hasAnyScore,
  isScoreInRange,
  isScoresBalanced,
  MAHJONG_MAX_ABS_SCORE,
  sumCommittedTotals,
  type SeatScores,
} from "./mahjong-scoring";

type RoundRow = {
  id: number;
  status: MahjongRoundStatus;
  roundNo: number | null;
  score0: number | null;
  score1: number | null;
  score2: number | null;
  score3: number | null;
  updatedAt: Date;
  committedAt: Date | null;
};

@Injectable()
export class MahjongService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatService: WechatService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(userId: number): Promise<ApiMahjongSessionSnapshot> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");

    const code = await this.allocateDisplayCode();
    const scene = await this.allocateInviteScene();

    const session = await this.prisma.mahjongSession.create({
      data: {
        code,
        createdByUserId: userId,
        participants: {
          create: {
            userId,
            seatIndex: 0,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
          },
        },
        inviteCode: {
          create: { scene },
        },
      },
    });

    return this.getSnapshot(session.id, userId);
  }

  async joinSession(sessionId: string, userId: number): Promise<ApiMahjongSessionSnapshot> {
    const session = await this.prisma.mahjongSession.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });
    if (!session) throw new NotFoundException("牌局不存在");
    if (session.status !== MahjongSessionStatus.active) {
      throw new BadRequestException("牌局已结束，无法加入");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");

    const existing = session.participants.find((p) => p.userId === userId);
    if (existing) {
      return this.getSnapshot(sessionId, userId);
    }

    const taken = new Set(session.participants.map((p) => p.seatIndex));
    let seatIndex = -1;
    for (let i = 0; i < 4; i++) {
      if (!taken.has(i)) {
        seatIndex = i;
        break;
      }
    }
    if (seatIndex < 0) {
      throw new BadRequestException("牌局人数已满");
    }

    await this.prisma.mahjongParticipant.create({
      data: {
        sessionId,
        userId,
        seatIndex,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    });

    await this.touchSession(sessionId);
    return this.getSnapshot(sessionId, userId);
  }

  async joinByScene(scene: string, userId: number): Promise<ApiMahjongSessionSnapshot> {
    const invite = await this.prisma.mahjongInviteCode.findUnique({ where: { scene } });
    if (!invite) throw new NotFoundException("邀请码无效");
    return this.joinSession(invite.sessionId, userId);
  }

  async getSnapshot(sessionId: string, userId: number): Promise<ApiMahjongSessionSnapshot> {
    await this.assertParticipant(sessionId, userId);
    return this.buildSnapshot(sessionId);
  }

  async listMySessions(userId: number): Promise<ApiMahjongSessionList> {
    const participations = await this.prisma.mahjongParticipant.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            participants: {
              orderBy: { seatIndex: "asc" },
              include: { user: { select: { nickname: true, avatarUrl: true } } },
            },
            rounds: { where: { status: MahjongRoundStatus.committed } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const items = participations.map((p) => {
      const s = p.session;
      const totals = sumCommittedTotals(s.rounds);
      return {
        sessionId: s.id,
        code: s.code,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        endedAt: s.endedAt?.toISOString() ?? null,
        totals,
        participants: s.participants.map((part) => ({
          seatIndex: part.seatIndex,
          nickname: part.user.nickname ?? part.nickname,
          avatarUrl: part.user.avatarUrl ?? part.avatarUrl,
          isCreator: part.userId === s.createdByUserId,
        })),
      };
    });

    let highestScore = 0;
    for (const item of items) {
      for (const t of item.totals) {
        if (t > highestScore) highestScore = t;
      }
    }

    return {
      items,
      stats: {
        totalSessions: items.length,
        highestScore,
      },
    };
  }

  async saveDraft(
    sessionId: string,
    userId: number,
    rawScores: Array<number | null>,
  ): Promise<ApiMahjongSaveDraftResult> {
    await this.assertParticipant(sessionId, userId);
    await this.assertActive(sessionId);

    const scores = this.normalizePartialScores(rawScores);
    if (!hasAnyScore(scores)) {
      throw new BadRequestException("请至少填写一个座位的分数");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const draft = await tx.mahjongRound.findFirst({
        where: { sessionId, status: MahjongRoundStatus.draft },
      });

      // 客户端提交完整四席快照（含 null）；以本次提交覆盖草稿
      const merged: SeatScores = scores;

      let round: RoundRow;
      if (draft) {
        round = await tx.mahjongRound.update({
          where: { id: draft.id },
          data: {
            score0: merged[0],
            score1: merged[1],
            score2: merged[2],
            score3: merged[3],
            updatedByUserId: userId,
          },
        });
      } else {
        round = await tx.mahjongRound.create({
          data: {
            sessionId,
            status: MahjongRoundStatus.draft,
            score0: merged[0],
            score1: merged[1],
            score2: merged[2],
            score3: merged[3],
            updatedByUserId: userId,
          },
        });
      }

      let committed = false;
      let balanced: boolean | null = null;

      if (areAllSeatsFilled(merged)) {
        const maxRound = await tx.mahjongRound.aggregate({
          where: { sessionId, status: MahjongRoundStatus.committed },
          _max: { roundNo: true },
        });
        const nextNo = (maxRound._max.roundNo ?? 0) + 1;
        balanced = isScoresBalanced(merged);
        round = await tx.mahjongRound.update({
          where: { id: round.id },
          data: {
            status: MahjongRoundStatus.committed,
            roundNo: nextNo,
            committedAt: new Date(),
            updatedByUserId: userId,
          },
        });
        committed = true;
      }

      await tx.mahjongSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });

      return { committed, balanced };
    });

    const snapshot = await this.buildSnapshot(sessionId);
    return {
      committed: result.committed,
      balanced: result.balanced,
      snapshot,
    };
  }

  async updateRound(
    sessionId: string,
    roundId: number,
    userId: number,
    scores: [number, number, number, number],
  ): Promise<ApiMahjongSessionSnapshot> {
    await this.assertParticipant(sessionId, userId);
    await this.assertActive(sessionId);

    if (scores.some((s) => !Number.isInteger(s))) {
      throw new BadRequestException("分数必须为整数");
    }
    if (scores.some((s) => !isScoreInRange(s))) {
      throw new BadRequestException(`单席分数须在 ±${MAHJONG_MAX_ABS_SCORE} 内`);
    }
    if (scores[0] + scores[1] + scores[2] + scores[3] !== 0) {
      throw new BadRequestException("四席分数总和必须为 0");
    }

    const round = await this.prisma.mahjongRound.findFirst({
      where: { id: roundId, sessionId },
    });
    if (!round) throw new NotFoundException("轮次不存在");
    if (round.status !== MahjongRoundStatus.committed) {
      throw new BadRequestException("只能修改已转正的历史轮");
    }

    await this.prisma.mahjongRound.update({
      where: { id: roundId },
      data: {
        score0: scores[0],
        score1: scores[1],
        score2: scores[2],
        score3: scores[3],
        updatedByUserId: userId,
      },
    });
    await this.touchSession(sessionId);
    return this.buildSnapshot(sessionId);
  }

  async endSession(sessionId: string, userId: number): Promise<ApiMahjongSessionSnapshot> {
    await this.assertParticipant(sessionId, userId);
    await this.assertActive(sessionId);

    await this.prisma.$transaction(async (tx) => {
      await tx.mahjongRound.deleteMany({
        where: { sessionId, status: MahjongRoundStatus.draft },
      });
      await tx.mahjongSession.update({
        where: { id: sessionId },
        data: {
          status: MahjongSessionStatus.ended,
          endedAt: new Date(),
        },
      });
    });

    return this.buildSnapshot(sessionId);
  }

  async ensureInviteScene(sessionId: string, userId: number): Promise<string> {
    await this.assertParticipant(sessionId, userId);
    const existing = await this.prisma.mahjongInviteCode.findUnique({ where: { sessionId } });
    if (existing) return existing.scene;

    const scene = await this.allocateInviteScene();
    await this.prisma.mahjongInviteCode.create({
      data: { sessionId, scene },
    });
    return scene;
  }

  async getWxacode(sessionId: string, userId: number): Promise<ApiMahjongWxacodeResult> {
    await this.assertParticipant(sessionId, userId);
    const scene = await this.ensureInviteScene(sessionId, userId);
    const page =
      this.configService.get<string>("WECHAT_MAHJONG_WXACODE_PAGE") ??
      "pages/mahjongScore/index";

    const buffer = await this.wechatService.getUnlimitedWxacode({ scene, page });
    return {
      scene,
      imageBase64: buffer.toString("base64"),
    };
  }

  async resolveScene(scene: string): Promise<{ sessionId: string; status: MahjongSessionStatus }> {
    const invite = await this.prisma.mahjongInviteCode.findUnique({
      where: { scene },
      include: { session: true },
    });
    if (!invite) throw new NotFoundException("邀请码无效");
    return { sessionId: invite.sessionId, status: invite.session.status };
  }

  private async buildSnapshot(sessionId: string): Promise<ApiMahjongSessionSnapshot> {
    const session = await this.prisma.mahjongSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          orderBy: { seatIndex: "asc" },
          include: { user: { select: { nickname: true, avatarUrl: true } } },
        },
        rounds: { orderBy: [{ roundNo: "desc" }, { id: "desc" }] },
        inviteCode: true,
      },
    });
    if (!session) throw new NotFoundException("牌局不存在");

    const committed = session.rounds.filter((r) => r.status === MahjongRoundStatus.committed);
    const draftRow = session.rounds.find((r) => r.status === MahjongRoundStatus.draft) ?? null;
    const totals = sumCommittedTotals(committed);

    return {
      sessionId: session.id,
      code: session.code,
      status: session.status,
      createdByUserId: session.createdByUserId,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
      inviteScene: session.inviteCode?.scene ?? null,
      participants: session.participants.map((p) => ({
        userId: p.userId,
        seatIndex: p.seatIndex,
        nickname: p.user.nickname ?? p.nickname,
        avatarUrl: p.user.avatarUrl ?? p.avatarUrl,
        isCreator: p.userId === session.createdByUserId,
      })),
      totals,
      draft: draftRow ? this.toApiRound(draftRow) : null,
      rounds: committed
        .slice()
        .sort((a, b) => (b.roundNo ?? 0) - (a.roundNo ?? 0))
        .map((r) => this.toApiRound(r)),
    };
  }

  private toApiRound(row: RoundRow): ApiMahjongRound {
    const scores = this.rowToScores(row);
    const filled = areAllSeatsFilled(scores);
    return {
      id: row.id,
      status: row.status,
      roundNo: row.roundNo,
      scores,
      balanced: filled ? isScoresBalanced(scores) : null,
      updatedAt: row.updatedAt.toISOString(),
      committedAt: row.committedAt?.toISOString() ?? null,
    };
  }

  private rowToScores(row: {
    score0: number | null;
    score1: number | null;
    score2: number | null;
    score3: number | null;
  }): SeatScores {
    return [row.score0, row.score1, row.score2, row.score3];
  }

  private normalizePartialScores(raw: Array<number | null>): SeatScores {
    if (!Array.isArray(raw) || raw.length !== 4) {
      throw new BadRequestException("scores 必须为长度为 4 的数组");
    }
    return raw.map((v, i) => {
      if (v === null || v === undefined) return null;
      if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) {
        throw new BadRequestException(`座位 ${i} 分数必须为整数或 null`);
      }
      if (!isScoreInRange(v)) {
        throw new BadRequestException(`座位 ${i} 分数须在 ±${MAHJONG_MAX_ABS_SCORE} 内`);
      }
      return v;
    }) as SeatScores;
  }

  private async assertParticipant(sessionId: string, userId: number) {
    const p = await this.prisma.mahjongParticipant.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!p) throw new ForbiddenException("你不是该牌局的参与者");
  }

  private async assertActive(sessionId: string) {
    const session = await this.prisma.mahjongSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("牌局不存在");
    if (session.status !== MahjongSessionStatus.active) {
      throw new BadRequestException("牌局已结束，无法修改");
    }
  }

  private async touchSession(sessionId: string) {
    await this.prisma.mahjongSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
  }

  private async allocateDisplayCode(): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const code = generateDisplayCode();
      const exists = await this.prisma.mahjongSession.findUnique({ where: { code } });
      if (!exists) return code;
    }
    throw new BadRequestException("生成牌局号失败，请重试");
  }

  private async allocateInviteScene(): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const scene = generateInviteScene();
      const exists = await this.prisma.mahjongInviteCode.findUnique({ where: { scene } });
      if (!exists) return scene;
    }
    throw new BadRequestException("生成邀请码失败，请重试");
  }
}
