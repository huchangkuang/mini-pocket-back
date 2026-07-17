import { get, patch, post } from "@/utils/request";
import type {
  ApiMahjongSaveDraftResult,
  ApiMahjongSessionList,
  ApiMahjongSessionSnapshot,
  ApiMahjongWxacodeResult,
} from "@/types/api";

export function createMahjongSession(): Promise<ApiMahjongSessionSnapshot> {
  return post<ApiMahjongSessionSnapshot>("/mahjong/sessions");
}

export function listMahjongSessions(): Promise<ApiMahjongSessionList> {
  return get<ApiMahjongSessionList>("/mahjong/sessions");
}

export function getMahjongSnapshot(sessionId: string): Promise<ApiMahjongSessionSnapshot> {
  return get<ApiMahjongSessionSnapshot>(`/mahjong/sessions/${sessionId}`);
}

export function joinMahjongSession(sessionId: string): Promise<ApiMahjongSessionSnapshot> {
  return post<ApiMahjongSessionSnapshot>(`/mahjong/sessions/${sessionId}/join`);
}

export function joinMahjongByScene(scene: string): Promise<ApiMahjongSessionSnapshot> {
  return post<ApiMahjongSessionSnapshot>("/mahjong/sessions/join-by-scene", { scene });
}

export function saveMahjongDraft(
  sessionId: string,
  scores: Array<number | null>,
): Promise<ApiMahjongSaveDraftResult> {
  return patch<ApiMahjongSaveDraftResult>(`/mahjong/sessions/${sessionId}/draft`, { scores });
}

export function updateMahjongRound(
  sessionId: string,
  roundId: number,
  scores: [number, number, number, number],
): Promise<ApiMahjongSessionSnapshot> {
  return patch<ApiMahjongSessionSnapshot>(`/mahjong/sessions/${sessionId}/rounds/${roundId}`, {
    scores,
  });
}

export function endMahjongSession(sessionId: string): Promise<ApiMahjongSessionSnapshot> {
  return post<ApiMahjongSessionSnapshot>(`/mahjong/sessions/${sessionId}/end`);
}

export function getMahjongWxacode(sessionId: string): Promise<ApiMahjongWxacodeResult> {
  return get<ApiMahjongWxacodeResult>(`/mahjong/sessions/${sessionId}/wxacode`);
}
