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
  const trackRef = useRef<HTMLDivElement>(null);
  // 标记是否是无缝滚动的过渡阶段
  const isResettingRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoPlay && total > 1) {
      timerRef.current = setInterval(() => {
        next();
      }, interval);
    }
  }, [autoPlay, interval, total]);

  const next = useCallback(() => {
    if (total <= 1) return;
    if (isResettingRef.current) return;

    if (current === total - 1) {
      // 最后一张切换到拼接的
      setCurrent(total);
      isResettingRef.current = true;
    } else {
      setCurrent(prev => prev + 1);
    }
    resetTimer();
  }, [current, total, resetTimer]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    if (isResettingRef.current) return;

    if (current === 0) {
      // 瞬间无动画切到拼接
      isResettingRef.current = true;
      setCurrent(total);
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          trackRef.current.style.transform = `translateX(-${total * 100}%)`;
          // 强制重绘
          trackRef.current.offsetHeight;
          trackRef.current.style.transition = "transform 0.6s ease";
          setCurrent(total - 1);
          isResettingRef.current = false;
        }
      }, 0);
    } else {
      setCurrent(prev => prev - 1);
    }
    resetTimer();
  }, [current, total, resetTimer]);

  const goTo = useCallback(
    (index: number) => {
      if (total <= 1 || isResettingRef.current) return;
      setCurrent(index);
      resetTimer();
    },
    [resetTimer, total],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (total <= 1 || isResettingRef.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      next();
    } else if (diff < -threshold) {
      prev();
    }
  };

  useEffect(() => {
    if (total <= 1) return;
    if (current === total && isResettingRef.current) {
      const timer = setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          trackRef.current.style.transform = "translateX(0%)";
          trackRef.current.offsetHeight;
          trackRef.current.style.transition = "transform 0.6s ease";
          setCurrent(0);
          isResettingRef.current = false;
        }
      }, 600); 

      return () => clearTimeout(timer);
    }
  }, [current, total]);

  useEffect(() => {
    if (total > 1) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer, total]);

  const renderSlides = () => {
    if (total === 0) return null;
    // 基础轮播项 + 最后拼接第一张
    const slides = [...children, children[0]];
    return slides.map((child, index) => (
      <div key={index} className={styles.slide}>
        {child}
      </div>
    ));
  };

  return (
    <div
      className={styles.carousel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={trackRef}
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {renderSlides()}
      </div>

      {showArrows && total > 1 && (
        <>
          <button 
            className={`${styles.arrow} ${styles.prev}`} 
            onClick={prev}
            disabled={isResettingRef.current}
          >
            ‹
          </button>
          <button 
            className={`${styles.arrow} ${styles.next}`} 
            onClick={next}
            disabled={isResettingRef.current}
          >
            ›
          </button>
        </>
      )}

      {showDots && total > 1 && (
        <div className={styles.dots}>
          {children.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current % total ? styles.active : ""}`}
              onClick={() => goTo(index)}
              disabled={isResettingRef.current}
            />
          ))}
        </div>
      )}
    </div>
  );
}