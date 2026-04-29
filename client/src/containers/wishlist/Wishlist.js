import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [removed, setRemoved] = useState(null); // id of item fading out
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setItems(data);
  }, []);

  const handleRemove = (id) => {
    setRemoved(id);
    setTimeout(() => {
      const updated = items.filter((i) => i._id !== id);
      setItems(updated);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setRemoved(null);
    }, 350);
  };

  const handleMoveToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((c) => c._id === item._id);
    if (!exists) {
      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    handleRemove(item._id);
  };

  return (
    <div className="wl-root">
      {/* ── HEADER ── */}
      <div className="wl-header">
        <div className="wl-header-left">
          <p className="wl-eyebrow">Your</p>
          <h1 className="wl-title">Wishlist</h1>
        </div>
        {items.length > 0 && (
          <span className="wl-count">
            {items.length} item{items.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="wl-divider" />

      {/* ── EMPTY STATE ── */}
      {items.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              width="56"
              height="56"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 className="wl-empty-title">Your wishlist is empty</h2>
          <p className="wl-empty-sub">
            Save items you love and find them here anytime.
          </p>
          <button className="wl-shop-btn" onClick={() => navigate("/")}>
            Start Shopping
          </button>
        </div>
      ) : (
        /* ── GRID ── */
        <div className="wl-grid">
          {items.map((item) => (
            <div
              key={item._id}
              className={`wl-card ${removed === item._id ? "wl-card--out" : ""}`}
            >
              {/* Image */}
              <div
                className="wl-card-img-wrap"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  className="wl-card-img"
                  draggable={false}
                />
                <div className="wl-card-overlay">
                  <span>View Product</span>
                </div>
              </div>

              {/* Remove button */}
              <button
                className="wl-remove-btn"
                onClick={() => handleRemove(item._id)}
                aria-label="Remove from wishlist"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Info */}
              <div className="wl-card-info">
                <p className="wl-card-name">{item.name}</p>
                <div className="wl-card-price-row">
                  <span className="wl-card-price">₹{item.price}</span>
                  <span className="wl-card-mrp">
                    ₹{Math.round(item.price * 1.3)}
                  </span>
                </div>

                <button
                  className="wl-add-btn"
                  onClick={() => handleMoveToCart(item)}
                >
                  Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
