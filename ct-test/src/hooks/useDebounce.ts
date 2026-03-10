import { useState, useEffect, useRef, useCallback } from "react";

// 防抖值
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 防抖函数
export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): T {
  const timerRef = useRef<number | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  ) as T;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
