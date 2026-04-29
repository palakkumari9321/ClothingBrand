import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "./Cart.css";

function Cart() {
  const { cart, decreaseQty, removeFromCart, addToCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0,
  );
  const delivery = subtotal > 499 ? 0 : 49;
  const total = subtotal + delivery;

  return (
    <div className="ct-root">
      {/* ── HEADER ── */}
      <div className="ct-header">
        <div>
          <p className="ct-eyebrow">Your</p>
          <h1 className="ct-title">Shopping Bag</h1>
        </div>
        {cart.length > 0 && (
          <span className="ct-count">
            {cart.length} item{cart.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="ct-divider" />

      {/* ── EMPTY ── */}
      {cart.length === 0 ? (
        <div className="ct-empty">
          <div className="ct-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              width="52"
              height="52"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="ct-empty-title">Your bag is empty</h2>
          <p className="ct-empty-sub">
            Looks like you haven't added anything yet.
          </p>
          <button className="ct-shop-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="ct-body">
          {/* ── ITEMS ── */}
          <div className="ct-items">
            {cart.map((item, i) => (
              <div
                className="ct-item"
                key={i}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* image */}
                <div
                  className="ct-item-img"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name}
                    draggable={false}
                  />
                </div>

                {/* details */}
                <div className="ct-item-info">
                  <div className="ct-item-top">
                    <div>
                      <p className="ct-item-brand">BRAND COLLECTION</p>
                      <h3 className="ct-item-name">{item.name}</h3>
                      <p className="ct-item-meta">
                        Size: <strong>{item.selectedSize}</strong>
                      </p>
                    </div>
                    <button
                      className="ct-remove-btn"
                      onClick={() => removeFromCart(item)}
                      aria-label="Remove item"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        width="16"
                        height="16"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="ct-item-bottom">
                    {/* qty controls */}
                    <div className="ct-qty">
                      <button
                        className="ct-qty-btn"
                        onClick={() => decreaseQty(item)}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="ct-qty-num">{item.qty || 1}</span>
                      <button
                        className="ct-qty-btn"
                        onClick={() => addToCart(item)}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>

                    <p className="ct-item-price">
                      ₹{(item.price * (item.qty || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="ct-summary">
            <h2 className="ct-summary-title">Order Summary</h2>

            <div className="ct-summary-rows">
              <div className="ct-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="ct-summary-row">
                <span>Delivery</span>
                <span className={delivery === 0 ? "ct-free" : ""}>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              {delivery > 0 && (
                <p className="ct-delivery-note">
                  Add ₹{499 - subtotal} more for free delivery
                </p>
              )}
            </div>

            <div className="ct-summary-divider" />

            <div className="ct-summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <p className="ct-summary-tax">Inclusive of all taxes</p>

            <button
              className="ct-checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <button className="ct-continue-btn" onClick={() => navigate("/")}>
              ← Continue Shopping
            </button>

            {/* trust badges */}
            <div className="ct-badges">
              {[
                { icon: "🔒", text: "Secure Checkout" },
                { icon: "↩", text: "Easy Returns" },
                { icon: "🚚", text: "Fast Delivery" },
              ].map((b) => (
                <div className="ct-badge" key={b.text}>
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
