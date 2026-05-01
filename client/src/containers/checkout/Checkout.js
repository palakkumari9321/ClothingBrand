import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "./Checkout.css";

function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  // ✅ CHANGE 1: email field add kiya
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [shakeCard, setShakeCard] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 450);
  };
  // check type
  const isBuyNow =
    new URLSearchParams(location.search).get("type") === "buynow";
  // get items
  const items = isBuyNow
    ? JSON.parse(localStorage.getItem("buyNowItem")) || []
    : cart;
  const getQty = (item) => item.qty || item.quantity || 1;
  const getPrice = (item) =>
    parseFloat(item.discountedPrice || item.price || item.Price || 0);

  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item) * getQty(item),
    0,
  );
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.email || !form.address) {
      triggerShake();
      return;
    }

    if (items.length === 0) {
      alert("No items to order");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        cart: items, // ✅ ALWAYS items
        ...form,
      };

      // 🔥 COD
      if (paymentMethod === "cod") {
        const res = await fetch("http://localhost:8082/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          handleSuccess();
        } else {
          alert(data.message || "Order failed");
        }
      }

      // 🔥 STRIPE
      if (paymentMethod === "stripe") {
        const res = await fetch("http://localhost:8082/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.url) {
          localStorage.setItem("userEmail", form.email);
          window.location.href = data.url;
        } else {
          alert(data.error || "Payment failed");
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSuccess = () => {
    localStorage.setItem("userEmail", form.email);

    if (isBuyNow) {
      localStorage.removeItem("buyNowItem"); // ✅ only 1 item clear
    } else {
      setCart([]); // ✅ full cart clear
    }

    navigate("/success");
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-grid">
        {/* ── LEFT: Order Summary ── */}
        <div className="summary-panel">
          <div className="summary-header">
            <h2>Order Summary</h2>
            <span className="item-count">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="summary-items">
            {items.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              items.map((item, idx) => (
                <div className="summary-item" key={idx}>
                  <div className="item-img-wrap">
                    {item.image || item.images?.[0] ? (
                      <img
                        src={item.image || item.images[0]}
                        alt={item.name || item.title}
                      />
                    ) : (
                      <div className="item-img-placeholder">
                        <svg
                          width="22"
                          height="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <span className="item-qty-badge">{getQty(item)}</span>
                  </div>
                  <div className="item-info">
                    <p className="item-name">{item.name || item.title}</p>
                    {item.selectedSize && (
                      <p className="item-variant">Size: {item.selectedSize}</p>
                    )}
                  </div>
                  <p className="item-price">
                    ₹{(getPrice(item) * getQty(item)).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Delivery</span>
              <span>
                {deliveryFee === 0 ? "—" : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Checkout Form ── */}
        <div className={`checkout-card ${shakeCard ? "shake" : ""}`}>
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>Complete your order details below</p>
          </div>

          <p className="section-label">Delivery Info</p>
          <div className="field-group">
            {/* Name */}
            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.06 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* ✅ CHANGE 3: Email field add kiya — phone ke baad */}
            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="input-wrap textarea-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <textarea
                name="address"
                placeholder="Delivery Address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="payment-section">
            <p className="section-label">Payment Method</p>
            <div className="payment-options">
              <label
                className={`payment-card ${paymentMethod === "cod" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  readOnly
                  checked={paymentMethod === "cod"}
                />
                <span className="payment-icon">🚚</span>
                <span className="payment-label">Cash on Delivery</span>
                <span className="payment-check">
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>

              <label
                className={`payment-card ${paymentMethod === "stripe" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("stripe")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  readOnly
                  checked={paymentMethod === "stripe"}
                />
                <span className="payment-icon">💳</span>
                <span className="payment-label">Pay Online (Stripe)</span>
                <span className="payment-check">
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>
            </div>
          </div>

          <button
            className="btn-order"
            onClick={handleOrder}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Processing…
              </>
            ) : (
              <>
                Place Order
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          <div className="secure-badge">
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure & encrypted checkout
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
