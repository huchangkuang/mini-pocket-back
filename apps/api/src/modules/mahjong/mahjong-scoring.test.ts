import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  areAllSeatsFilled,
  hasAnyScore,
  isScoreInRange,
  isScoresBalanced,
  MAHJONG_MAX_ABS_SCORE,
  mergeSeatScores,
  sumCommittedTotals,
} from "./mahjong-scoring";

describe("mahjong-scoring", () => {
  it("detects filled seats and balance", () => {
    assert.equal(areAllSeatsFilled([1, -1, 0, 0]), true);
    assert.equal(areAllSeatsFilled([1, -1, null, 0]), false);
    assert.equal(isScoresBalanced([80, -20, -30, -30]), true);
    assert.equal(isScoresBalanced([80, -20, -30, -20]), false);
    assert.equal(isScoresBalanced([80, -20, null, -30]), false);
  });

  it("requires at least one score for draft", () => {
    assert.equal(hasAnyScore([null, null, null, null]), false);
    assert.equal(hasAnyScore([0, null, null, null]), true);
  });

  it("limits absolute score magnitude", () => {
    assert.equal(isScoreInRange(0), true);
    assert.equal(isScoreInRange(MAHJONG_MAX_ABS_SCORE), true);
    assert.equal(isScoreInRange(-MAHJONG_MAX_ABS_SCORE), true);
    assert.equal(isScoreInRange(MAHJONG_MAX_ABS_SCORE + 1), false);
    assert.equal(isScoreInRange(-(MAHJONG_MAX_ABS_SCORE + 1)), false);
  });

  it("merges seat patches with undefined keep", () => {
    const merged = mergeSeatScores([80, -20, null, null], [undefined, undefined, -30, undefined]);
    assert.deepEqual(merged, [80, -20, -30, null]);
  });

  it("sums committed totals ignoring null as 0", () => {
    const totals = sumCommittedTotals([
      { score0: 80, score1: -20, score2: -30, score3: -30 },
      { score0: -10, score1: 10, score2: 0, score3: 0 },
    ]);
    assert.deepEqual(totals, [70, -10, -30, -30]);
  });
});
