import { useState, useEffect, useRef, useCallback } from "react";

// 节流值
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastRun.current;

    if (elapsed >= delay) {
      setThrottledValue(value);
      lastRun.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }, delay - elapsed);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

// 节流函数
export function useThrottleFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): T {
  const lastRun = useRef(0);
  const timerRef = useRef<number | null>(null);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastRun.current;

      if (elapsed >= delay) {
        fn(...args);
        lastRun.current = now;
      } else if (!timerRef.current) {
        timerRef.current = window.setTimeout(() => {
          fn(...args);
          lastRun.current = Date.now();
          timerRef.current = null;
        }, delay - elapsed);
      }
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

  return throttledFn;
}
