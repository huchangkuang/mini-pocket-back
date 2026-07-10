import { getStorageSync } from "@tarojs/taro";
import {
  activateDecision as activateRemoteDecision,
  createDecision,
  listDecisions,
  removeDecision as removeRemoteDecision,
  updateCurrentDecision,
  updateDecision,
} from "@/services/decisionsApi";
import type { ApiDecision, ApiDecisionSummary } from "@/types/api";
import { isLoggedIn } from "@/utils/authStore";
import {
  addLocalItem,
  decisionConfig,
  deleteLocalItem,
  getDecisionId,
  updateLocalItem,
  USE_LIST,
  type DecisionItem,
} from "@/pages/doDescription/store";

export type DecisionViewItem = {
  id: string;
  apiId?: number;
  title: string;
  list: string[];
  isActive?: boolean;
};

function mapApiSummary(item: ApiDecisionSummary): DecisionViewItem {
  return {
    id: String(item.id),
    apiId: item.id,
    title: item.title,
    list: item.options,
    isActive: item.isActive,
  };
}

function mapApiDecision(item: ApiDecision): DecisionViewItem {
  return {
    id: String(item.id),
    apiId: item.id,
    title: item.title,
    list: item.options,
    isActive: item.isActive,
  };
}

function mapLocalItem(item: DecisionItem): DecisionViewItem {
  return {
    id: item.id,
    title: item.title,
    list: item.list,
  };
}

export function applyDecisionToConfig(item: DecisionViewItem): void {
  decisionConfig.title = item.title;
  decisionConfig.list = item.list;
  decisionConfig.id = item.id;
  decisionConfig.apiId = item.apiId;
}

export function clearDecisionConfigSelection(): void {
  decisionConfig.id = undefined;
  decisionConfig.apiId = undefined;
}

export async function loadDecisions(): Promise<{
  current: DecisionViewItem;
  list: DecisionViewItem[];
}> {
  if (isLoggedIn()) {
    const data = await listDecisions();
    const current = mapApiSummary(data.current);
    const list = data.list.map(mapApiSummary);
    applyDecisionToConfig(current);
    return { current, list };
  }

  const localList: DecisionItem[] = getStorageSync(USE_LIST) || [];
  const current: DecisionViewItem = {
    id: decisionConfig.id || "",
    title: decisionConfig.title,
    list: decisionConfig.list,
  };

  return {
    current,
    list: localList.map(mapLocalItem),
  };
}

export async function activateDecision(item: DecisionViewItem): Promise<void> {
  if (isLoggedIn() && item.apiId) {
    const result = await activateRemoteDecision(item.apiId);
    applyDecisionToConfig(mapApiDecision(result));
    return;
  }

  applyDecisionToConfig(item);
}

export async function removeDecision(item: DecisionViewItem): Promise<void> {
  if (isLoggedIn() && item.apiId) {
    await removeRemoteDecision(item.apiId);
    return;
  }

  deleteLocalItem(item.id);
}

export type SaveDecisionParams = {
  type: "add" | "edit";
  id?: string;
  apiId?: number;
  title: string;
  options: string[];
  editCurrent?: boolean;
};

export async function saveDecision(
  params: SaveDecisionParams
): Promise<DecisionViewItem> {
  const title = params.title.trim();
  const options = params.options;

  if (isLoggedIn()) {
    if (params.type === "add") {
      const result = await createDecision({ title, options });
      const item = mapApiDecision(result);
      applyDecisionToConfig(item);
      return item;
    }

    if (params.editCurrent || !params.apiId) {
      const result = await updateCurrentDecision({ title, options });
      const item = mapApiDecision(result);
      applyDecisionToConfig(item);
      return item;
    }

    const result = await updateDecision(params.apiId, { title, options });
    const item = mapApiDecision(result);
    applyDecisionToConfig(item);
    return item;
  }

  decisionConfig.title = title;
  decisionConfig.list = options;

  if (params.type === "add" || !params.id) {
    const item: DecisionItem = {
      id: getDecisionId(),
      title,
      list: options,
    };
    addLocalItem(item);
    decisionConfig.id = item.id;
    decisionConfig.apiId = undefined;
    return mapLocalItem(item);
  }

  const item: DecisionItem = { id: params.id, title, list: options };
  updateLocalItem(item);
  decisionConfig.id = params.id;
  decisionConfig.apiId = undefined;
  return mapLocalItem(item);
}
