export type ApiDecision = {
  id: number;
  title: string;
  options: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiDecisionSummary = {
  id: number;
  title: string;
  options: string[];
  isActive: boolean;
};

export type ApiDecisionsList = {
  current: ApiDecisionSummary;
  list: ApiDecisionSummary[];
};
