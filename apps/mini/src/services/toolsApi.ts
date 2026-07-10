import type { ListToolsQuery, ApiToolsList, ApiTool } from "@/types/api";
import { get } from "@/utils/request";

export function listTools(query: ListToolsQuery = {}): Promise<ApiToolsList> {
  const params: Record<string, string | number | undefined> = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 100,
    sort: query.sort === "heat" ? "heat" : "default",
  };

  if (query.sort === "heat") {
    params.order = query.order === "asc" ? "asc" : "desc";
  }

  if (query.category && query.category !== "all") {
    params.category = query.category;
  }
  if (query.keyword?.trim()) {
    params.keyword = query.keyword.trim();
  }

  return get<ApiToolsList>("/tools", params);
}

export function getTool(id: number): Promise<ApiTool> {
  return get<ApiTool>(`/tools/${id}`);
}
