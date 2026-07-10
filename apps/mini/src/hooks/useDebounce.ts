import { useCallback, useEffect, useRef } from "react";

// 防抖
export function useDebounce(fn, delay, dep = []) {
  const { current } = useRef<{ fn: Function; timer: NodeJS.Timeout | null }>({
    fn,
    timer: null,
  });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn]
  );

  return useCallback(function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      current.fn.call(this, ...args);
    }, delay);
  }, dep);
}
