import type { ReactNode } from "react";
import styles from "./index.module.css";

export interface HeaderProps {
  /** 标题文字 */
  title: string;
  /** 左侧插槽 */
  left?: ReactNode;
  /** 右侧插槽 */
  right?: ReactNode;
}

export default function Header({ title, left, right }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>{left}</div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
