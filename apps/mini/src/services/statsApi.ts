import type { ApiRecordActiveDayResult, ApiRecordToolUseResult } from "@/types/api";
import { post } from "@/utils/request";

export function recordActiveDay(): Promise<ApiRecordActiveDayResult> {
  return post<ApiRecordActiveDayResult>("/stats/active-day");
}

export function recordToolUse(data: {
  toolId?: number;
  routePath?: string;
}): Promise<ApiRecordToolUseResult> {
  return post<ApiRecordToolUseResult>("/stats/tool-use", data);
}
