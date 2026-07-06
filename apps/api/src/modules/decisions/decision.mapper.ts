import { UserDecision } from '@prisma/client';

export type DecisionOptions = string[];

export function normalizeOptions(options: string[]): DecisionOptions {
  return options.map((item) => item.trim()).filter(Boolean);
}

export function mapDecision(decision: UserDecision) {
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

export function mapDecisionSummary(decision: UserDecision) {
  return {
    id: decision.id,
    title: decision.title,
    options: decision.options as DecisionOptions,
    isActive: decision.isActive,
  };
}
