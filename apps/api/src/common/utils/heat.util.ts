export function formatHeatScore(score: number): string {
  if (score >= 1000) {
    const value = score / 1000;
    return Number.isInteger(value) ? `${value}k` : `${value.toFixed(1)}k`;
  }
  if (score >= 999) {
    return '999+';
  }
  return String(score);
}
