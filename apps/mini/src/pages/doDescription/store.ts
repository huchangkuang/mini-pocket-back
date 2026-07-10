import { idGenerator } from "@/utils/idGenerator";
import { getStorageSync, setStorageSync } from "@tarojs/taro";

export type DecisionItem = {
  id: string;
  title: string;
  list: string[];
};
export const decisionConfig: Omit<DecisionItem, "id"> & {
  id?: string;
  apiId?: number;
} = {
  title: "今晚吃什么？",
  list: ["火锅", "披萨", "寿司", "烤肉", "面条", "沙拉"],
};

export const USE_LIST = "useList";

const DESCRIPTION_KEY = "DESCRIPTION_KEY";

const decisionIdFn = idGenerator(DESCRIPTION_KEY);

export const getDecisionId = (ids?: string[]): string => {
  let id = decisionIdFn() as string;
  const idList: string[] = ids ?? (getStorageSync(USE_LIST) || []).map((i) => i.id);
  while (idList.includes(id)) {
    id = decisionIdFn() as string;
  }
  return id;
};

export const updateLocalItem = (item: DecisionItem) => {
  const list: DecisionItem[] = getStorageSync(USE_LIST) || [];
  if (!list.length) return;
  const index = list.findIndex((i) => i.id === item.id);
  if (index > -1) {
    list.splice(index, 1);
    list.unshift(item);
    setStorageSync(USE_LIST, [...list]);
  }
};

export const addLocalItem = (item: DecisionItem) => {
  const list: DecisionItem[] = getStorageSync(USE_LIST) || [];
  setStorageSync(USE_LIST, [item, ...list]);
};

export const deleteLocalItem = (id: string) => {
  const list: DecisionItem[] = getStorageSync(USE_LIST) || [];
  setStorageSync(
    USE_LIST,
    list.filter((i) => i.id !== id),
  );
};
