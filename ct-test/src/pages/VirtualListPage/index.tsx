import { useState, useCallback } from "react";
import VirtualList from "../../components/VirtualList";
import styles from "./index.module.css";

interface DataItem {
  id: number;
  title: string;
  height: number;
}

const PAGE_SIZE = 50;

export default function VirtualListPage() {
  const [items, setItems] = useState<DataItem[]>(() =>
    Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: i,
      title: `Item ${i + 1}`,
      height: 60 + Math.floor(Math.random() * 40),
    })),
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setItems((prev) => {
      const newItems = Array.from({ length: PAGE_SIZE }, (_, i) => ({
        id: prev.length + i,
        title: `Item ${prev.length + i + 1}`,
        height: 60 + Math.floor(Math.random() * 40),
      }));

      if (prev.length >= 450) {
        setHasMore(false);
      }

      return [...prev, ...newItems];
    });

    setLoading(false);
  }, []);

  return (
    <div className={styles.page}>
      <VirtualList
        items={items}
        height="100%"
        estimatedItemHeight={80}
        getItemKey={(item) => item.id}
        loadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        renderItem={(item, index) => (
          <div className={styles.item} style={{ height: item.height }}>
            <span className={styles.index}>{index + 1}</span>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.height}>{item.height}px</span>
          </div>
        )}
      />
    </div>
  );
}
