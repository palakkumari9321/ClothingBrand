import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CancelOrder.css";

const REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found better price elsewhere",
  "Delivery time too long",
  "Wrong item / size selected",
  "Other",
];

export default function CancelOrder() {
  const { state } = useLocation(); // order object passed via navigate
  const navigate = useNavigate();
  const order = state?.order;

  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ── Guard: agar koi order nahi mila ── */
  if (!order) {
    return (
      <div className="co-empty">
        <p>Order not found.</p>
        <button onClick={() => navigate("/orders")}>← Back to Orders</button>
      </div>
    );
  }

  const finalReason = selected === "Other" ? custom.trim() : selected;

  /* ── Submit cancel ── */
  const handleCancel = async () => {
    if (!finalReason) return alert("Please select a reason");

    setLoading(true);
    try {
      await axios.put(`http://localhost:8082/my-orders/${order._id}/cancel`, {
        reason: finalReason,
      });
      setSuccess(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className="co-success">
        <div className="co-success-icon">✓</div>
        <h2>Order Cancelled</h2>
        <p>
          Your order <strong>#{order._id.slice(-8).toUpperCase()}</strong> has
          been cancelled successfully.
        </p>
        <button onClick={() => navigate("/orders")}>← Back to Orders</button>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <div className="co-page">
      {/* HEADER */}
      <button className="co-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="co-title">Cancel Order</h1>
      <p className="co-subtitle">
        Order <span>#{order._id.slice(-8).toUpperCase()}</span>
      </p>

      {/* PRODUCT PREVIEW */}
      <div className="co-card">
        <p className="co-card-label">Items in this order</p>

        {order.items.map((item, i) => (
          <div className="co-item" key={i}>
            <img src={item.image} alt={item.name} />
            <div className="co-item-info">
              <p>{item.name}</p>
              <small>
                Qty: {item.qty} &nbsp;|&nbsp; Size: {item.size || "N/A"}
              </small>
            </div>
            <span>₹{item.price.toLocaleString("en-IN")}</span>
          </div>
        ))}

        <div className="co-total">
          <span>Order Total</span>
          <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      {/* REASON SELECTION */}
      <div className="co-card">
        <p className="co-card-label">Why do you want to cancel?</p>

        <div className="co-reasons">
          {REASONS.map((r) => (
            <button
              key={r}
              className={`co-reason-btn ${selected === r ? "active" : ""}`}
              onClick={() => {
                setSelected(r);
                setCustom("");
              }}
            >
              <span className="co-radio">{selected === r ? "●" : "○"}</span>
              {r}
            </button>
          ))}
        </div>

        {/* Custom reason textarea */}
        {selected === "Other" && (
          <textarea
            className="co-textarea"
            placeholder="Tell us more about your reason…"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {/* SUBMIT */}
      <button
        className={`co-submit ${loading ? "loading" : ""}`}
        onClick={handleCancel}
        disabled={loading || !finalReason}
      >
        {loading ? "Cancelling…" : "Confirm Cancellation"}
      </button>

      <p className="co-note">⚠️ This action cannot be undone once confirmed.</p>
    </div>
  );
}
