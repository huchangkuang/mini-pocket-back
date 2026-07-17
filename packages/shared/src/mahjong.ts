export type MahjongSessionStatus = "active" | "ended";
export type MahjongRoundStatus = "draft" | "committed";

export type ApiMahjongScores = [number | null, number | null, number | null, number | null];

export type ApiMahjongParticipant = {
  userId: number;
  seatIndex: number;
  nickname: string | null;
  avatarUrl: string | null;
  isCreator: boolean;
};

export type ApiMahjongRound = {
  id: number;
  status: MahjongRoundStatus;
  roundNo: number | null;
  scores: ApiMahjongScores;
  balanced: boolean | null;
  updatedAt: string;
  committedAt: string | null;
};

export type ApiMahjongSessionSnapshot = {
  sessionId: string;
  code: string;
  status: MahjongSessionStatus;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
  inviteScene: string | null;
  participants: ApiMahjongParticipant[];
  totals: [number, number, number, number];
  draft: ApiMahjongRound | null;
  rounds: ApiMahjongRound[];
};

export type ApiMahjongSessionListItem = {
  sessionId: string;
  code: string;
  status: MahjongSessionStatus;
  createdAt: string;
  endedAt: string | null;
  totals: [number, number, number, number];
  participants: Array<{
    seatIndex: number;
    nickname: string | null;
    avatarUrl: string | null;
    isCreator: boolean;
  }>;
};

export type ApiMahjongSessionList = {
  items: ApiMahjongSessionListItem[];
  stats: {
    totalSessions: number;
    highestScore: number;
  };
};

export type ApiMahjongSaveDraftResult = {
  committed: boolean;
  balanced: boolean | null;
  snapshot: ApiMahjongSessionSnapshot;
};

export type ApiMahjongWxacodeResult = {
  scene: string;
  /** base64-encoded PNG without data-url prefix */
  imageBase64: string;
};
