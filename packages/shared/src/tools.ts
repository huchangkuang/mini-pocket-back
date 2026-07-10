export type Accent = "primary" | "secondary" | "tertiary";

export type Category = {
  id: number;
  code: string;
  label: string;
};

export type Tool = {
  id: number;
  routePath: string;
  name: string;
  description: string;
  iconKey: string;
  accent: Accent;
  category: {
    code: string;
    label: string;
  };
  heat: string;
  heatScore: number;
  isFavorite: boolean;
};

export type ApiToolsList = {
  list: Tool[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListToolsQuery = {
  category?: string;
  keyword?: string;
  sort?: "heat" | "default";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};
