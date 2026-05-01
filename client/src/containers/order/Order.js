import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Order.css";

const STATUS = {
  processing: { label: "Processing", icon: "⏳" },
  shipped: { label: "Shipped", icon: "🚚" },
  delivered: { label: "Delivered", icon: "✅" },
  cancelled: { label: "Cancelled", icon: "❌" },
};

export default function Order() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (userEmail) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8082/orders?email=${userEmail}`,
      );
      setOrders(res.data.orders || []);
    } catch {
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("userEmail");
    if (saved) {
      setEmail(saved);
      fetchOrders(saved);
    } else setLoading(false);
  }, []);

  /* Cancel page pe navigate karo — order data saath bhejo */
  const goToCancel = (order) => {
    navigate("/cancel-order", { state: { order } });
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders
      .filter((o) => {
        if (statusFilter !== "all" && o.orderStatus !== statusFilter)
          return false;
        const d = new Date(o.createdAt);
        if (dateFilter === "today")
          return d.toDateString() === now.toDateString();
        if (dateFilter === "week") {
          const w = new Date();
          w.setDate(now.getDate() - 7);
          return d >= w;
        }
        if (dateFilter === "month")
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        return true;
      })
      .filter((o) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          o._id.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
        );
      });
  }, [orders, statusFilter, dateFilter, search]);

  const grouped = useMemo(
    () =>
      filteredOrders.reduce((acc, order) => {
        const key = new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        (acc[key] = acc[key] || []).push(order);
        return acc;
      }, {}),
    [filteredOrders],
  );

  const handleEmailSubmit = () => {
    if (!inputEmail.includes("@")) return alert("Enter a valid email");
    localStorage.setItem("userEmail", inputEmail);
    setEmail(inputEmail);
    fetchOrders(inputEmail);
  };

  if (!email) {
    return (
      <div className="order-gate">
        <h2>Track Your Orders 📦</h2>
        <input
          type="email"
          placeholder="Enter your email address"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
        />
        <button onClick={handleEmailSubmit}>View Orders</button>
      </div>
    );
  }

  if (loading) return <p className="loading">Loading your orders…</p>;

  return (
    <div className="order-page">
      <h1>My Orders</h1>

      <input
        className="search-box"
        type="text"
        placeholder="🔍  Search by order ID or product name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        {["all", "processing", "shipped", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            className={statusFilter === f ? "active" : ""}
            onClick={() => setStatusFilter(f)}
          >
            {f !== "all" && STATUS[f]?.icon + " "}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="filters">
        {[
          { key: "all", label: "All Time" },
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={dateFilter === key ? "active" : ""}
            onClick={() => setDateFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="empty">No orders found 😕</p>
      )}

      {Object.entries(grouped).map(([date, list]) => (
        <div key={date}>
          <h3 className="date-heading">{date}</h3>

          {list.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-top">
                <span>#{order._id.slice(-8).toUpperCase()}</span>
                <span className={`status ${order.orderStatus}`}>
                  {STATUS[order.orderStatus]?.icon}{" "}
                  {STATUS[order.orderStatus]?.label}
                </span>
              </div>

              {order.items.map((item, i) => (
                <div className="item" key={i}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <small>
                      Qty: {item.qty} &nbsp;|&nbsp; Size: {item.size || "N/A"}
                    </small>
                  </div>
                  <span>₹{item.price.toLocaleString("en-IN")}</span>
                </div>
              ))}

              <div className="order-footer">
                <strong>
                  Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                </strong>

                {order.orderStatus === "processing" && (
                  <button
                    className="cancel-btn"
                    onClick={() => goToCancel(order)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
