import type { ApiDecision, ApiDecisionsList } from "@/types/api";
import { del, get, patch, post } from "@/utils/request";

export function listDecisions(): Promise<ApiDecisionsList> {
  return get<ApiDecisionsList>("/decisions");
}

export function createDecision(data: {
  title: string;
  options: string[];
}): Promise<ApiDecision> {
  return post<ApiDecision>("/decisions", data);
}

export function updateDecision(
  id: number,
  data: { title?: string; options?: string[] }
): Promise<ApiDecision> {
  return patch<ApiDecision>(`/decisions/${id}`, data);
}

export function updateCurrentDecision(data: {
  title?: string;
  options?: string[];
}): Promise<ApiDecision> {
  return patch<ApiDecision>("/decisions/current", data);
}

export function activateDecision(id: number): Promise<ApiDecision> {
  return post<ApiDecision>(`/decisions/${id}/activate`);
}

export function removeDecision(id: number): Promise<{ removed: boolean }> {
  return del<{ removed: boolean }>(`/decisions/${id}`);
}
