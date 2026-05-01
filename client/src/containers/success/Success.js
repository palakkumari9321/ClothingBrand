import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Success.css";

function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStripe = searchParams.get("session_id"); // ✅ ab milega
  const [count, setCount] = useState(8);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 100);

    // Countdown + redirect to /orders
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders"); // ✅ Orders page pe redirect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={`success-page ${visible ? "visible" : ""}`}>
      {/* Floating background particles */}
      <div className="particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle p${i + 1}`} />
        ))}
      </div>

      <div className="success-card">
        {/* Logo */}
        <div className="success-logo" onClick={() => navigate("/")}>
          Everwear
        </div>

        {/* Icon */}
        <div className={`icon-wrap ${isStripe ? "stripe-icon" : "cod-icon"}`}>
          {isStripe ? (
            <svg viewBox="0 0 52 52" className="checkmark">
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-tick"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 52 52" className="checkmark">
              <circle
                className="checkmark-circle cod"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-tick"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="success-title">
          {isStripe ? "Payment Successful! 🎉" : "Order Confirmed! 🛍️"}
        </h1>

        {/* Subtitle */}
        <p className="success-sub">
          {isStripe
            ? "Your payment has been received. We're preparing your order right now!"
            : "Your order has been placed! Our team will deliver it soon."}
        </p>

        {/* COD / Stripe specific banner */}
        {isStripe ? (
          <div className="status-banner stripe-banner">
            <span className="banner-icon">💳</span>
            <div>
              <p className="banner-title">Payment Confirmed via Stripe</p>
              <p className="banner-sub">
                Amount has been deducted from your account
              </p>
            </div>
          </div>
        ) : (
          <div className="status-banner cod-banner">
            <span className="banner-icon">🚚</span>
            <div>
              <p className="banner-title">Cash on Delivery</p>
              <p className="banner-sub">
                Please keep the payment ready at the time of delivery
              </p>
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Notification Pills */}
        <p className="notif-label">Notifications Sent</p>
        <div className="info-pills">
          <div className="pill">
            <span className="pill-icon">📦</span>
            <span>Order Processing</span>
          </div>
          <div className="pill">
            <span className="pill-icon">📱</span>
            <span>SMS Sent</span>
          </div>
          <div className="pill">
            <span className="pill-icon">📧</span>
            <span>Email Sent</span>
          </div>
          <div className="pill">
            <span className="pill-icon">📞</span>
            <span>Call Initiated</span>
          </div>
        </div>

        <div className="divider" />

        {/* Buttons */}
        <div className="success-btns">
          <button className="btn-primary" onClick={() => navigate("/orders")}>
            View My Orders
          </button>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>

        {/* Redirect note */}
        <p className="auto-redirect">
          Redirecting to your orders in{" "}
          <span className="count-badge">{count}s</span>
        </p>
      </div>
    </div>
  );
}

export default Success;
