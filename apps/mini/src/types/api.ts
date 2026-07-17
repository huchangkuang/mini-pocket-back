// 共享类型 — 从 @mini-pocket/shared re-export
export type { ApiResponse } from "@mini-pocket/shared";
export type { Accent, Category, Tool, ApiToolsList, ListToolsQuery } from "@mini-pocket/shared";
export type {
  FavoriteCategory,
  ApiFavorite,
  ApiFavoritesList,
  ApiToggleFavoriteResult,
  ListFavoritesQuery,
} from "@mini-pocket/shared";
export type { ApiUserProfile, ApiLoginResult } from "@mini-pocket/shared";
export type {
  ApiUserStats,
  ApiUserLevel,
  ApiLevelConfig,
  ApiUserMe,
  ApiRecordActiveDayResult,
  ApiRecordToolUseResult,
} from "@mini-pocket/shared";
export type { ApiDecision, ApiDecisionSummary, ApiDecisionsList } from "@mini-pocket/shared";
export type { FeedbackType, ApiSubmitFeedbackResult } from "@mini-pocket/shared";
export type {
  PersistScope,
  ApiUploadResult,
  ApiPersistedFile,
  ApiPersistStorageResult,
} from "@mini-pocket/shared";
export type {
  ApiCreateGameResult,
  ApiGuessRecord,
  ApiGameInfo,
  ApiGameGuessResult,
} from "@mini-pocket/shared";
export type {
  MahjongSessionStatus,
  MahjongRoundStatus,
  ApiMahjongScores,
  ApiMahjongParticipant,
  ApiMahjongRound,
  ApiMahjongSessionSnapshot,
  ApiMahjongSessionListItem,
  ApiMahjongSessionList,
  ApiMahjongSaveDraftResult,
  ApiMahjongWxacodeResult,
} from "@mini-pocket/shared";

// 兼容旧名
export type { Tool as ApiTool } from "@mini-pocket/shared";
export type { Category as ApiCategory } from "@mini-pocket/shared";
