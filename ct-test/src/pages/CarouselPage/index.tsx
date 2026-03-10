import Carousel from "../../components/Carousel";
import styles from "./index.module.css";

export default function CarouselPage() {
  const images = [
    "https://picsum.photos/800/400?random=1",
    "https://picsum.photos/800/400?random=2",
    "https://picsum.photos/800/400?random=3",
  ];

  return (
    <div className={styles.page}>
      <Carousel>
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`slide-${index}`}
            style={{ width: "100%", height: "12rem", objectFit: "cover" }}
          />
        ))}
      </Carousel>
      <div className={styles.info}>
        <p>支持手势滑动切换</p>
        <p>支持自动播放</p>
        <p>支持指示点和箭头导航</p>
      </div>
    </div>
  );
}
