import { useRef, useEffect, useState, type CSSProperties } from "react";
import styles from "./index.module.css";

export interface LazyImageProps {
  /** 图片地址 */
  src: string;
  /** 图片描述文字 */
  alt?: string;
  /** 占位图地址 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 提前加载的距离，默认 50px */
  rootMargin?: string;
}

export default function LazyImage({
  src,
  alt = "",
  placeholder,
  className,
  style,
  rootMargin = "50px",
}: LazyImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("图片进入视口，开始加载:", src);
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, src]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ""}`}
      style={style}
    >
      {inView ? (
        <img
          src={src}
          alt={alt}
          className={`${styles.img} ${loaded ? styles.loaded : ""}`}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div
          className={styles.placeholder}
          style={
            placeholder ? { backgroundImage: `url(${placeholder})` } : undefined
          }
        />
      )}
    </div>
  );
}
