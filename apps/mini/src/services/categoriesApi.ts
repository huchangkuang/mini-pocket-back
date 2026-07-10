import type { ApiCategory } from "@/types/api";
import { get } from "@/utils/request";

export function listCategories(): Promise<ApiCategory[]> {
  return get<ApiCategory[]>("/categories", undefined, false);
}
