import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { encrypt, decrypt } from '../../common/utils/crypto.util';

/**
 * Calculate Bulls (A) and Cows (B) for a single guess against the target.
 * Handles repeated digits correctly.
 */
export function calculateAB(target: string, guess: string): string {
  const targetUsed = [false, false, false, false];
  const guessUsed = [false, false, false, false];
  let a = 0;
  let b = 0;

  // First pass: count bulls (exact position + digit matches)
  for (let i = 0; i < 4; i++) {
    if (guess[i] === target[i]) {
      a++;
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: count cows (digit matches at different positions)
  for (let i = 0; i < 4; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < 4; j++) {
      if (targetUsed[j]) continue;
      if (guess[i] === target[j]) {
        b++;
        targetUsed[j] = true;
        break;
      }
    }
  }

  return `${a}A${b}B`;
}

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createGame(userId: number, targetNumber: string) {
    const secret = this.configService.getOrThrow<string>('GAME_TARGET_SECRET');
    const targetHash = encrypt(targetNumber, secret);

    const game = await this.prisma.game.create({
      data: {
        creatorId: userId,
        targetHash,
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
      },
    });

    return {
      gameId: game.id,
      createdAt: game.createdAt.toISOString(),
      status: game.status,
    };
  }

  async getGameInfo(gameId: string, userId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        creator: {
          select: { nickname: true, avatarUrl: true },
        },
        guesses: {
          where: { userId },
          orderBy: { attemptNumber: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    const myHistory = game.guesses.map((g) => ({
      guess: g.guess,
      result: g.result,
      attemptNumber: g.attemptNumber,
    }));

    return {
      gameId: game.id,
      creator: {
        nickname: game.creator.nickname,
        avatarUrl: game.creator.avatarUrl,
      },
      status: game.status,
      myHistory,
      isCreator: game.creatorId === userId,
    };
  }

  async submitGuess(gameId: string, userId: number, guess: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        guesses: {
          where: { userId },
          orderBy: { attemptNumber: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    // Prevent creator from guessing their own game
    if (game.creatorId === userId) {
      throw new ForbiddenException('不能猜自己出的题');
    }

    // Check if the user has already won
    const alreadyWon = game.guesses.some((g) => g.result === '4A0B');
    if (alreadyWon) {
      throw new BadRequestException('你已经猜对了！');
    }

    // Decrypt the target number
    const secret = this.configService.getOrThrow<string>('GAME_TARGET_SECRET');
    const targetNumber = decrypt(game.targetHash, secret);

    // Calculate result
    const result = calculateAB(targetNumber, guess);
    const attemptNumber = game.guesses.length + 1;
    const won = result === '4A0B';

    // Create the guess record
    await this.prisma.gameGuess.create({
      data: {
        gameId,
        userId,
        guess,
        result,
        attemptNumber,
      },
    });

    // Update game status if won
    if (won) {
      await this.prisma.game.update({
        where: { id: gameId },
        data: { status: 'won' },
      });
    }

    // Build updated history
    const history = [
      ...game.guesses.map((g) => ({
        guess: g.guess,
        result: g.result,
        attemptNumber: g.attemptNumber,
      })),
      { guess, result, attemptNumber },
    ];

    return {
      result,
      attemptNumber,
      won,
      history,
    };
  }
}
