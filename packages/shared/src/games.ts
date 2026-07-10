export type ApiCreateGameResult = {
  gameId: string;
  createdAt: string;
  status: "waiting";
};

export type ApiGuessRecord = {
  guess: string;
  result: string;
  attemptNumber: number;
};

export type ApiGameInfo = {
  gameId: string;
  creator: {
    nickname: string | null;
    avatarUrl: string | null;
  };
  status: "waiting" | "won";
  myHistory: ApiGuessRecord[];
  isCreator: boolean;
};

export type ApiGameGuessResult = {
  result: string;
  attemptNumber: number;
  won: boolean;
  history: ApiGuessRecord[];
};
