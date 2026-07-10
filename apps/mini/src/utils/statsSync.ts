import Taro from "@tarojs/taro";
import { recordActiveDay, recordToolUse } from "@/services/statsApi";
import { getUser, isLoggedIn, updateUserProgress } from "@/utils/authStore";

const ACTIVE_DAY_KEY = "mini_pocket_last_active_day";

type StoredActiveDay = {
  userId: number;
  date: string;
};

export function getShanghaiDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function readActiveDayRecord(): StoredActiveDay | null {
  try {
    const stored = Taro.getStorageSync(ACTIVE_DAY_KEY) as StoredActiveDay | undefined;
    return stored ?? null;
  } catch {
    return null;
  }
}

function saveActiveDayRecord(record: StoredActiveDay): void {
  Taro.setStorageSync(ACTIVE_DAY_KEY, record);
}

export async function syncDailyActive(): Promise<void> {
  if (!isLoggedIn()) return;

  const user = getUser();
  if (!user) return;

  const today = getShanghaiDateString();
  const lastRecord = readActiveDayRecord();
  if (lastRecord?.userId === user.id && lastRecord.date === today) {
    return;
  }

  try {
    const result = await recordActiveDay();
    saveActiveDayRecord({ userId: user.id, date: today });
    updateUserProgress(result.stats, result.level);
  } catch {
    // 静默失败，不阻塞启动
  }
}

export function openToolPage(path: string, toolId?: number): void {
  recordToolUse({ toolId, routePath: path })
    .then((result) => {
      if (!isLoggedIn()) return;
      updateUserProgress(result.stats, result.level);
      if (result.leveledUp && result.newTitle) {
        Taro.showToast({
          title: `恭喜晋升「${result.newTitle}」`,
          icon: "success",
          duration: 2000,
        });
      }
    })
    .catch(() => {});

  Taro.navigateTo({ url: path });
}
