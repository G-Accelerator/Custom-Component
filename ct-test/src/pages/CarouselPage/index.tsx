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
        <ul>
          <li>
            <h3>1.轮播图介绍</h3>
            <p>手势滑动切换</p>
            <p>自动播放控制</p>
            <p>指示点和箭头导航控制</p>
          </li>
          <li>
            <h3>2.列表介绍</h3>
            <p>触底加载</p>
            <p>图片懒加载（出现在视口的才加载）</p>
          </li>
          <li>
            <h3>3.附加：虚拟列表介绍</h3>
            <p>解决长列表渲染卡顿问题</p>
            <p>只渲染可视区域内的元素</p>
            <p>通过计算得出当前应该显示的列表项</p>
          </li>
          <li>
            <h1>-----陈涛-----</h1>
          </li>
        </ul>
      </div>
    </div>
  );
}
