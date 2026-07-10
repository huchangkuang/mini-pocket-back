import { UserDecision } from "@prisma/client";
import type { ApiDecision, ApiDecisionSummary } from "@mini-pocket/shared";

export type DecisionOptions = string[];

export function normalizeOptions(options: string[]): DecisionOptions {
  return options.map((item) => item.trim()).filter(Boolean);
}

export function mapDecision(decision: UserDecision): ApiDecision {
  return {
    id: decision.id,
    title: decision.title,
    options: decision.options as DecisionOptions,
    isActive: decision.isActive,
    lastUsedAt: decision.lastUsedAt?.toISOString() ?? null,
    createdAt: decision.createdAt.toISOString(),
    updatedAt: decision.updatedAt.toISOString(),
  };
}

export function mapDecisionSummary(decision: UserDecision): ApiDecisionSummary {
  return {
    id: decision.id,
    title: decision.title,
    options: decision.options as DecisionOptions,
    isActive: decision.isActive,
  };
}
