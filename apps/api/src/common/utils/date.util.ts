const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 获取上海时区当天 0 点的 UTC Date，用于 @db.Date 存储 */
export function getShanghaiTodayDate(): Date {
  const shanghaiNow = new Date(Date.now() + SHANGHAI_OFFSET_MS);
  const year = shanghaiNow.getUTCFullYear();
  const month = shanghaiNow.getUTCMonth();
  const day = shanghaiNow.getUTCDate();
  return new Date(Date.UTC(year, month, day));
}
