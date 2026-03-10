import {
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import styles from "./index.module.css";
import { useThrottleFn } from "../../hooks";

export interface InfiniteListProps<T = unknown> {
  /** 列表数据 */
  items?: T[];
  /** 加载更多回调 */
  loadMore: () => void | Promise<void>;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 渲染列表项 */
  renderItem?: (item: T, index: number) => ReactNode;
  /** 子元素（与 items + renderItem 二选一） */
  children?: ReactNode;
  /** 触发加载的距离阈值，默认 100 */
  threshold?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 自定义加载中元素 */
  loadingElement?: ReactNode;
  /** 自定义加载完成元素 */
  endElement?: ReactNode;
}

export default function InfiniteList<T>({
  items,
  loadMore,
  hasMore,
  loading = false,
  renderItem,
  children,
  threshold = 100,
  className,
  style,
  loadingElement,
  endElement,
}: InfiniteListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const checkScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom < threshold) {
      loadingRef.current = true;
      await loadMore();
      loadingRef.current = false;
    }
  }, [hasMore, loadMore, threshold]);

  const handleScroll = useThrottleFn(checkScroll, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const hasItems = items ? items.length > 0 : !!children;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ""}`}
      style={style}
    >
      {items && renderItem
        ? items.map((item, index) => (
            <div key={index} className={styles.item}>
              {renderItem(item, index)}
            </div>
          ))
        : children}

      {loading && (
        <div className={styles.loading}>
          {loadingElement || <span>加载中...</span>}
        </div>
      )}

      {!hasMore && hasItems && (
        <div className={styles.end}>
          {endElement || <span>没有更多了</span>}
        </div>
      )}
    </div>
  );
}
