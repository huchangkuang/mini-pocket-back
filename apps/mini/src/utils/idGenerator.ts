export const idGenerator = (uniqueKey?: string | number | Symbol) => {
  let id = 0;
  return () => {
    id += 1;
    if (uniqueKey) {
      return `${uniqueKey}-${id}`;
    }
    return id;
  };
};
