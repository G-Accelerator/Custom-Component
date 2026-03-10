import { useState } from "react";
import Header from "./components/Header";
import CarouselPage from "./pages/CarouselPage";
import ListPage from "./pages/ListPage";
import VirtualListPage from "./pages/VirtualListPage";
import "./App.css";

const tabs = ["轮播图", "列表", "虚拟列表"];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const renderPage = () => {
    switch (activeTab) {
      case 0:
        return <CarouselPage />;
      case 1:
        return <ListPage />;
      case 2:
        return <VirtualListPage />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header title={tabs[activeTab]} />

      <main className="main">{renderPage()}</main>

      <nav className="tab-bar">
        {tabs.map((label, index) => (
          <button
            key={index}
            className={`tab-item ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
