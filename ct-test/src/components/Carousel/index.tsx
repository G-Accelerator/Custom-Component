import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import styles from "./index.module.css";

export interface CarouselProps {
  /** 轮播项内容 */
  children: ReactNode[];
  /** 是否自动播放，默认true */
  autoPlay?: boolean;
  /** 自动播放间隔 */
  interval?: number;
  /** 是否显示指示点 */
  showDots?: boolean;
  /** 是否显示前后箭头 */
  showArrows?: boolean;
}

export default function Carousel({
  children,
  autoPlay = true,
  interval = 3000,
  showDots = true,
  showArrows = true,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = children.length;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoPlay) {
      timerRef.current = window.setInterval(() => {
        setCurrent((prev) => (prev + 1) % total);
      }, interval);
    }
  }, [autoPlay, interval, total]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
    resetTimer();
  }, [total, resetTimer]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
    resetTimer();
  }, [total, resetTimer]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      resetTimer();
    },
    [resetTimer],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      next();
    } else if (diff < -threshold) {
      prev();
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer]);

  return (
    <div
      className={styles.carousel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {children.map((child, index) => (
          <div key={index} className={styles.slide}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <button className={`${styles.arrow} ${styles.prev}`} onClick={prev}>
            ‹
          </button>
          <button className={`${styles.arrow} ${styles.next}`} onClick={next}>
            ›
          </button>
        </>
      )}

      {showDots && (
        <div className={styles.dots}>
          {children.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current ? styles.active : ""}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
