import Carousel from "../../components/Carousel";
import styles from "./index.module.css";

export default function CarouselPage() {
  const images = ["/OIP-C.jpg", "/OIP-C (1).jpg", "/300px-地图-空间实验室.png"];

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
