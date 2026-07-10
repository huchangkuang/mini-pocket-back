import { useCallback, useEffect, useRef } from "react";

// 节流，一段时间内只执行一次
export function useThrottle(fn, delay, dep = []) {
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
    if (!current.timer) {
      current.timer = setTimeout(() => {
        clearTimeout(current.timer!);
        current.timer = null;
      }, delay);
      current.fn.call(this, ...args);
    }
  }, dep);
}
