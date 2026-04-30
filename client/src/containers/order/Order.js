import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Order.css";

const statusMap = {
  processing: { cls: "s-processing", label: "Processing" },
  shipped: { cls: "s-shipped", label: "Shipped" },
  delivered: { cls: "s-delivered", label: "Delivered" },
  cancelled: { cls: "s-cancelled", label: "Cancelled" },
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("userEmail");
    if (saved) {
      setEmail(saved);
      fetchOrders(saved);
    } else setLoading(false);
  }, []);

  const fetchOrders = async (userEmail) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8082/orders?email=${userEmail}`,
      );
      setOrders(res.data.orders || []);
    } catch {
      alert("Orders load nahi hue");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!inputEmail.includes("@")) return alert("Valid email daalo");
    localStorage.setItem("userEmail", inputEmail);
    setEmail(inputEmail);
    fetchOrders(inputEmail);
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel karna hai?")) return;
    await axios.put(`http://localhost:8082/api/my-orders/${id}/cancel`);
    fetchOrders(email);
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  if (!email) {
    return (
      <div className="ew-gate">
        <h2 className="ew-title">My Orders</h2>
        <p className="ew-sub">Enter your email to view orders</p>
        <input
          type="email"
          placeholder="you@example.com"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
        />
        <button className="ew-submit" onClick={handleEmailSubmit}>
          Show Orders
        </button>
      </div>
    );
  }

  if (loading) return <p className="ew-loading">Loading...</p>;

  return (
    <div className="ew-root">
      <h2 className="ew-title">My Orders</h2>
      <p className="ew-sub">Track and manage your recent purchases</p>

      {/* Filter Pills */}
      <div className="pill-bar">
        {["all", "processing", "shipped", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            className={`pill ${filter === f ? "on" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="ew-empty">
          <div className="empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3>Nothing here</h3>
          <p>No orders for this status yet.</p>
        </div>
      )}

      {/* Order Cards */}
      {filtered.map((order) => {
        const { cls, label } = statusMap[order.orderStatus] || {};
        const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return (
          <div className="ew-card" key={order._id}>
            {/* Card Header */}
            <div className="card-top">
              <div className="card-top-left">
                <span className="oid">Order &nbsp;#{order._id.slice(-6)}</span>
                <span className="odate">{date}</span>
              </div>
              <span className={`status-pill ${cls}`}>{label}</span>
            </div>

            {/* Items */}
            <div className="items-wrap">
              {order.items.map((item, i) => (
                <div className="item-row" key={i}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-thumb"
                  />
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      Qty {item.qty} &nbsp;·&nbsp; Size {item.size || "N/A"}
                    </div>
                  </div>
                  <div className="item-price">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Card Footer */}
            <div className="card-foot">
              <div className="pay-chip">
                <div className="pay-dot" />
                <span className="pay-label">{order.paymentMethod}</span>
              </div>
              <div className="foot-right">
                {order.orderStatus === "processing" && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel order
                  </button>
                )}
                <span className="total">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Order;
