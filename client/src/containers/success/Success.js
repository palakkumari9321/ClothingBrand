import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Success.css";

function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStripe = searchParams.get("session_id");
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        {/* Everwear Logo */}
        <div className="success-logo" onClick={() => navigate("/")}>
          Everwear
        </div>

        {/* Animated checkmark */}
        <div className="check-wrap">
          <svg className="checkmark" viewBox="0 0 52 52">
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
        </div>

        <h1 className="success-title">
          {isStripe ? "Payment Successful!" : "Order Confirmed!"}
        </h1>

        <p className="success-sub">
          {isStripe
            ? "Your payment has been confirmed. Your order will be delivered soon."
            : "Your Cash on Delivery order has been placed successfully."}
        </p>

        <div className="divider" />

        {/* Info pills */}
        <div className="info-pills">
          <div className="pill">
            <span>📦</span>
            <span>Order Processing</span>
          </div>
          <div className="pill">
            <span>📱</span>
            <span>SMS Sent</span>
          </div>
          <div className="pill">
            <span>📧</span>
            <span>Email Sent</span>
          </div>
          <div className="pill">
            <span>📞</span>
            <span>Call Initiated</span>
          </div>
        </div>

        {/* COD note */}
        {!isStripe && (
          <div className="cod-note">
            🚚 Cash on Delivery — Payment will be collected at the time of
            delivery.
          </div>
        )}

        {/* Buttons */}
        <div className="success-btns">
          <button className="btn-primary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
          <button className="btn-secondary" onClick={() => navigate("/orders")}>
            View Orders
          </button>
        </div>

        <p className="auto-redirect">Redirecting to home in {count}s...</p>
      </div>
    </div>
  );
}

export default Success;
