import { get, post } from "@/utils/request";
import type { ApiCreateGameResult, ApiGameGuessResult, ApiGameInfo } from "@/types/api";

export function createGame(targetNumber: string): Promise<ApiCreateGameResult> {
  return post<ApiCreateGameResult>("/games", { targetNumber });
}

export function getGameInfo(gameId: string): Promise<ApiGameInfo> {
  return get<ApiGameInfo>(`/games/${gameId}`);
}

export function submitGuess(gameId: string, guess: string): Promise<ApiGameGuessResult> {
  return post<ApiGameGuessResult>(`/games/${gameId}/guess`, { guess });
}
