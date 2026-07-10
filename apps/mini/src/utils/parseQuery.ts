export const parseQuery = (query: string): Record<string, any> => {
  const newQuery = query.startsWith("?") ? query.slice(1) : query;
  return Object.fromEntries(newQuery.split("&").map((i) => i.split("=")));
};
export const getParam = (path: string) => {
  const [_, query] = path.split("?");
  if (!query) return {};
  return parseQuery(query);
};
export const dataToQuery = (query?: Record<string, any>): string => {
  if (!query) return "";
  return Object.entries(query)
    .filter((entry) => entry[1] || entry[1] === 0)
    .map((i) => i.join("="))
    .join("&");
};
