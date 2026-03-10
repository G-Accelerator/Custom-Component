import { useState, useCallback } from "react";
import InfiniteList from "../../components/InfiniteList";
import LazyImage from "../../components/LazyImage";
import styles from "./index.module.css";

interface ListItem {
  id: number;
  image: string;
  title: string;
}

export default function ListPage() {
  const [items, setItems] = useState<ListItem[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      image: `https://picsum.photos/400/200?random=${i}`,
      title: `Item ${i + 1}`,
    })),
  );
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newItems = Array.from({ length: 10 }, (_, i) => ({
      id: items.length + i,
      image: `https://picsum.photos/400/200?random=${items.length + i}`,
      title: `Item ${items.length + i + 1}`,
    }));

    setItems((prev) => [...prev, ...newItems]);
    setLoading(false);

    if (items.length >= 40) {
      setHasMore(false);
    }
  }, [items.length]);

  return (
    <div className={styles.page}>
      <InfiniteList
        items={items}
        hasMore={hasMore}
        loading={loading}
        loadMore={loadMore}
        style={{ height: "100%" }}
        renderItem={(item) => (
          <div className={styles.listItem}>
            <LazyImage
              src={item.image}
              alt={item.title}
              style={{ height: "8rem", borderRadius: "0.5rem" }}
            />
            <p className={styles.itemTitle}>{item.title}</p>
          </div>
        )}
      />
    </div>
  );
}
