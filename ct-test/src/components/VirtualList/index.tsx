import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import styles from "./index.module.css";
import { useDebounceFn } from "../../hooks";

export interface VirtualListProps<T> {
  /** 列表数据 */
  items: T[];
  /** 容器高度 */
  height: number | string;
  /** 容器宽度，默认 100% */
  width?: number | string;
  /** 固定行高（与 estimatedItemHeight 二选一） */
  itemHeight?: number;
  /** 预估行高，用于动态高度场景，默认 50 */
  estimatedItemHeight?: number;
  /** 上下缓冲区数量，默认 5 */
  overscan?: number;
  /** 渲染列表项 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 自定义 key 生成函数 */
  getItemKey?: (item: T, index: number) => string | number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 滚动回调 */
  onScroll?: (scrollTop: number) => void;
  /** 加载更多回调 */
  loadMore?: () => void | Promise<void>;
  /** 是否还有更多数据 */
  hasMore?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 触发加载的距离阈值（像素），默认 200 */
  threshold?: number;
  /** 自定义加载中元素 */
  loadingElement?: ReactNode;
  /** 自定义加载完成元素 */
  endElement?: ReactNode;
}

interface CachedPosition {
  index: number;
  top: number;
  bottom: number;
  height: number;
}

export default function VirtualList<T>({
  items,
  height,
  width = "100%",
  itemHeight,
  estimatedItemHeight = 50,
  overscan = 5,
  renderItem,
  getItemKey,
  className,
  style,
  onScroll,
  loadMore,
  hasMore = true,
  loading = false,
  threshold = 200,
  loadingElement,
  endElement,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const loadingRef = useRef(false);

  const isFixedHeight = itemHeight !== undefined;
  const h = itemHeight ?? estimatedItemHeight;

  const [positions, setPositions] = useState<CachedPosition[]>([]);

  // 初始化或 items 变化时更新 positions
  useEffect(() => {
    setPositions((prev) => {
      const newPositions: CachedPosition[] = [];
      let offset = 0;

      for (let i = 0; i < items.length; i++) {
        const existingHeight = prev[i]?.height ?? h;
        newPositions.push({
          index: i,
          top: offset,
          bottom: offset + existingHeight,
          height: existingHeight,
        });
        offset += existingHeight;
      }

      return newPositions;
    });
  }, [items.length, h]);

  // 获取容器高度
  const updateContainerHeight = useDebounceFn(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerHeight(container.clientHeight);
    const observer = new ResizeObserver(updateContainerHeight);
    observer.observe(container);

    return () => observer.disconnect();
  }, [updateContainerHeight]);

  // 定位当前滚动位置对应的第一个可见元素索引，用二分查找
  const findStartIndex = useCallback(
    (scrollTop: number) => {
      if (!positions.length) return 0;

      let low = 0;
      let high = positions.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const { top, bottom } = positions[mid];

        if (scrollTop >= top && scrollTop < bottom) {
          return mid;
        } else if (scrollTop < top) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      return Math.max(0, Math.min(low, positions.length - 1));
    },
    [positions],
  );

  // 计算可见区域
  const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);
  let endIndex = startIndex;
  const viewportBottom = scrollTop + containerHeight;

  while (
    endIndex < positions.length &&
    positions[endIndex]?.top < viewportBottom
  ) {
    endIndex++;
  }
  endIndex = Math.min(positions.length, endIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetTop = positions[startIndex]?.top ?? 0;
  const totalHeight =
    positions.length > 0 ? (positions[positions.length - 1]?.bottom ?? 0) : 0;

  // 动态高度：测量并更新
  useEffect(() => {
    if (isFixedHeight || !contentRef.current) return;

    const nodes = contentRef.current.children;
    let needUpdate = false;
    const updates: { index: number; height: number }[] = [];

    Array.from(nodes).forEach((node, i) => {
      const index = startIndex + i;
      if (index >= positions.length) return;

      const rect = node.getBoundingClientRect();
      const oldHeight = positions[index].height;

      if (Math.abs(rect.height - oldHeight) > 1) {
        needUpdate = true;
        updates.push({ index, height: rect.height });
      }
    });

    if (needUpdate) {
      setPositions((prev) => {
        const newPositions = [...prev];

        updates.forEach(({ index, height }) => {
          if (newPositions[index]) {
            newPositions[index] = { ...newPositions[index], height };
          }
        });

        // 重新计算 offset
        let offset = 0;
        for (let i = 0; i < newPositions.length; i++) {
          newPositions[i] = {
            ...newPositions[i],
            top: offset,
            bottom: offset + newPositions[i].height,
          };
          offset += newPositions[i].height;
        }

        return newPositions;
      });
    }
  }, [visibleItems, isFixedHeight, startIndex, positions]);

  // 触底加载
  const checkLoadMore = useCallback(async () => {
    if (!loadMore || !hasMore || loadingRef.current || !totalHeight) return;

    const distanceToBottom = totalHeight - scrollTop - containerHeight;

    if (distanceToBottom < threshold) {
      loadingRef.current = true;
      await loadMore();
      loadingRef.current = false;
    }
  }, [loadMore, hasMore, totalHeight, scrollTop, containerHeight, threshold]);

  useEffect(() => {
    checkLoadMore();
  }, [checkLoadMore]);

  // 滚动处理
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const newScrollTop = containerRef.current.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const isRenderingLast = startIndex + visibleItems.length >= items.length;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ""}`}
      style={{ height, width, ...style }}
    >
      <div
        className={styles.phantom}
        style={{ height: totalHeight + (loading || !hasMore ? 50 : 0) }}
      >
        <div
          ref={contentRef}
          className={styles.content}
          style={{ transform: `translateY(${offsetTop}px)` }}
        >
          {visibleItems.map((item, i) => {
            const index = startIndex + i;
            const key = getItemKey ? getItemKey(item, index) : index;
            return (
              <div
                key={key}
                style={isFixedHeight ? { height: itemHeight } : undefined}
              >
                {renderItem(item, index)}
              </div>
            );
          })}

          {isRenderingLast && loading && (
            <div className={styles.status}>
              {loadingElement || <span>加载中...</span>}
            </div>
          )}

          {isRenderingLast && !hasMore && items.length > 0 && (
            <div className={styles.status}>
              {endElement || <span>没有更多了</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
