import React, { useEffect, useState } from "react";
import "./Trends.css";
import { useNavigate } from "react-router-dom";

const TABS = [
  "All",
  "tshirts",
  "sweatshirts",
  "formalshirts",
  "jeans",
  "jackets",
];

function Trends() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8082/product");
        const data = await res.json();
        const allProducts = data?.data || [];

        const savedProducts = localStorage.getItem("trendingProducts");
        const savedTime = localStorage.getItem("trendingTime");

        const now = Date.now();

        // ⏳ 24 hours = 86400000 ms
        if (savedProducts && savedTime && now - savedTime < 86400000) {
          // ✅ Use saved data
          setProducts(JSON.parse(savedProducts));
        } else {
          // 🔥 Generate new random set
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 12);

          // 💾 Save new data + time
          localStorage.setItem("trendingProducts", JSON.stringify(selected));
          localStorage.setItem("trendingTime", now);

          setProducts(selected);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ FIXED FILTER (important)
  const filtered = (
    activeTab === "All"
      ? products
      : products.filter((p) =>
          p.type?.toLowerCase().includes(activeTab.toLowerCase()),
        )
  ).slice(0, 8);

  if (loading) {
    return (
      <div className="tr-loader">
        <div className="tr-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="tr-page">
      {/* 🔥 Banner */}
      <div className="tr-banner">
        <div>
          <p>What's Hot Right Now</p>
          <h1>Trending This Season</h1>
        </div>
      </div>

      {/* 🔧 Tabs */}
      <div className="tr-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" ? "🔥 All" : tab}
          </button>
        ))}
      </div>

      {/* 🛍 Grid */}
      {filtered.length > 0 ? (
        <div className="tr-grid">
          {/* Featured */}
          <div
            className="tr-card featured"
            onClick={() => navigate(`/product/${filtered[0]._id}`)}
          >
            <img src={filtered[0].images?.[0]} alt="" />
            <h3>{filtered[0].name}</h3>
            <p>₹{filtered[0].price}</p>
          </div>

          {/* Rest */}
          {filtered.slice(1).map((item) => (
            <div
              key={item._id}
              className="tr-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <img src={item.images?.[0]} alt="" />
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="tr-empty">No products found</p>
      )}
    </div>
  );
}

export default Trends;
