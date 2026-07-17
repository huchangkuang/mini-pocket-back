export type SeatScores = [number | null, number | null, number | null, number | null];

/** 单席绝对分上限，防止异常超大输入 */
export const MAHJONG_MAX_ABS_SCORE = 99999;

export function isScoreInRange(score: number): boolean {
  return Number.isInteger(score) && Math.abs(score) <= MAHJONG_MAX_ABS_SCORE;
}

export function isScoresBalanced(scores: SeatScores): boolean {
  if (scores.some((s) => s === null)) return false;
  return (scores[0]! + scores[1]! + scores[2]! + scores[3]!) === 0;
}

export function areAllSeatsFilled(scores: SeatScores): boolean {
  return scores.every((s) => s !== null);
}

export function hasAnyScore(scores: SeatScores): boolean {
  return scores.some((s) => s !== null);
}

/** Merge patch into base; undefined in patch means keep base value. */
export function mergeSeatScores(
  base: SeatScores,
  patch: Array<number | null | undefined>,
): SeatScores {
  return [
    patch[0] === undefined ? base[0] : patch[0],
    patch[1] === undefined ? base[1] : patch[1],
    patch[2] === undefined ? base[2] : patch[2],
    patch[3] === undefined ? base[3] : patch[3],
  ];
}

export function sumCommittedTotals(
  rounds: Array<{ score0: number | null; score1: number | null; score2: number | null; score3: number | null }>,
): [number, number, number, number] {
  const totals: [number, number, number, number] = [0, 0, 0, 0];
  for (const r of rounds) {
    totals[0] += r.score0 ?? 0;
    totals[1] += r.score1 ?? 0;
    totals[2] += r.score2 ?? 0;
    totals[3] += r.score3 ?? 0;
  }
  return totals;
}

export function generateDisplayCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `RM-${n}`;
}

export function generateInviteScene(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "m_";
  for (let i = 0; i < 10; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
