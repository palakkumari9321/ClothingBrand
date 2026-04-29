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
    fetch("http://localhost:8082/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Filter + only top 8 trending
  const filtered = (
    activeTab === "All"
      ? products
      : products.filter((p) => p.type === activeTab)
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
      {/* ── Hero Banner ── */}
      <div className="tr-banner">
        <div className="tr-banner-text">
          <p className="tr-eyebrow">What's Hot Right Now</p>
          <h1 className="tr-heading">
            Trending
            <br />
            This Season
          </h1>
          <p className="tr-desc">
            Handpicked styles flying off the shelves — get them before they're
            gone.
          </p>
        </div>
        <div className="tr-banner-numbers">
          <div className="tr-stat">
            <span className="tr-num">{products.length}+</span>
            <span className="tr-label">Products</span>
          </div>
          <div className="tr-divider" />
          <div className="tr-stat">
            <span className="tr-num">6</span>
            <span className="tr-label">Categories</span>
          </div>
          <div className="tr-divider" />
          <div className="tr-stat">
            <span className="tr-num">★ 4.8</span>
            <span className="tr-label">Avg Rating</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="tr-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tr-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" ? "🔥 All Trends" : tab}
          </button>
        ))}
      </div>

      {/* ── Trending Label ── */}
      <div className="tr-section-label">
        <span className="tr-fire">🔥</span>
        <h2>Top Picks</h2>
        <div className="tr-label-line" />
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="tr-grid">
          {/* Big featured card — first item */}
          <div
            className="tr-card tr-featured"
            onClick={() => navigate(`/product/${filtered[0]._id}`)}
          >
            <div className="tr-img-box">
              <img
                src={
                  Array.isArray(filtered[0].images)
                    ? filtered[0].images[0]
                    : filtered[0].images
                }
                alt={filtered[0].name}
                onError={(e) => (e.target.src = "/placeholder.jpg")}
              />
              <div className="tr-badge">Trending #1</div>
              <div className="tr-overlay">
                <button className="tr-quick">Shop Now →</button>
              </div>
            </div>
            <div className="tr-info">
              <span className="tr-type">{filtered[0].type}</span>
              <h3>{filtered[0].name}</h3>
              <p>{filtered[0].description?.slice(0, 65)}...</p>
              <strong>₹{filtered[0].price}</strong>
            </div>
          </div>

          {/* Remaining cards */}
          {filtered.slice(1).map((item, i) => (
            <div
              key={item._id}
              className="tr-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <div className="tr-img-box">
                <img
                  src={
                    Array.isArray(item.images) ? item.images[0] : item.images
                  }
                  alt={item.name}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="tr-rank">#{i + 2}</div>
                <div className="tr-overlay">
                  <button className="tr-quick">View →</button>
                </div>
              </div>
              <div className="tr-info">
                <span className="tr-type">{item.type}</span>
                <h3>{item.name}</h3>
                <strong>₹{item.price}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tr-empty">No trending products found 😕</div>
      )}

      {/* ── View All CTA ── */}
      <div className="tr-cta">
        <button onClick={() => navigate("/collection")} className="tr-cta-btn">
          Explore Full Collection →
        </button>
      </div>
    </div>
  );
}

export default Trends;
