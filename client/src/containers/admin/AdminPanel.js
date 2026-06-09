import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const API = "http://localhost:8082";

const STATUS_COLORS = {
  processing: "#b07800",
  shipped: "#1a52b8",
  delivered: "#1a7a40",
  cancelled: "#c02020",
};

const authAxios = () =>
  axios.create({
    baseURL: API,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export default function AdminPanel() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // ← NEW
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "", // ← empty rakho
    sizes: "",
    images: "",
    stockQuantity: "",
    type: "",
    subCategory: "",
  };
  const [productForm, setProductForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  /* ── Auth guard ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") navigate("/login");
  }, [navigate]);

  /* ── Fetch ── */
  const fetchStats = useCallback(async () => {
    const res = await authAxios().get("/api/admin/stats");
    setStats(res.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await authAxios().get("/api/admin/users");
    setUsers(res.data.users);
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await authAxios().get("/api/admin/orders");
    setOrders(res.data.orders);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await authAxios().get("/api/admin/products");
    setProducts(res.data.products || res.data.data || []);
  }, []);

  // ← NEW — categories fetch
  const fetchCategories = useCallback(async () => {
    try {
      const res = await authAxios().get("/getcategory");
      setCategories(res.data.data || []);
    } catch (err) {
      console.log("Categories fetch error:", err);
    }
  }, []);

  // ← Categories ek baar load karo
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setLoading(true);
    const map = {
      dashboard: fetchStats,
      users: fetchUsers,
      orders: fetchOrders,
      products: fetchProducts,
    };
    map[tab]?.().finally(() => setLoading(false));
  }, [tab, fetchStats, fetchUsers, fetchOrders, fetchProducts]);

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── Toggle user ── */
  const toggleUser = async (id) => {
    await authAxios().put(`/api/admin/users/${id}/toggle`);
    fetchUsers();
  };

  /* ── Update order status ── */
  const updateStatus = async (id, status) => {
    await authAxios().put(`/api/admin/orders/${id}/status`, { status });
    fetchOrders();
  };

  /* ── Product CRUD ── */
  const handleProductSubmit = async () => {
    // ← Validation
    if (!productForm.category) {
      alert("Please select a category");
      return;
    }

    const data = {
      ...productForm,
      price: Number(productForm.price),
      stockQuantity: Number(productForm.stockQuantity),
      sizes: productForm.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: productForm.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await authAxios().put(`/api/admin/products/${editingId}`, data);
      } else {
        await authAxios().post("/api/admin/products", data);
      }
      setProductForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving product");
    }
  };

  const editProduct = (p) => {
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category?.name || p.category, // ← name store karo
      sizes: (p.sizes || []).join(", "),
      images: (p.images || []).join(", "),
      stockQuantity: p.stockQuantity,
      type: p.type,
      subCategory: p.subCategory,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await authAxios().delete(`/api/admin/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Everwear</h2>
        <p className="sidebar-label">Admin Panel</p>

        <nav>
          {[
            { key: "dashboard", icon: "📊", label: "Dashboard" },
            { key: "orders", icon: "📦", label: "Orders" },
            { key: "products", icon: "👗", label: "Products" },
            { key: "users", icon: "👥", label: "Users" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`nav-item ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">
        {loading && <div className="admin-loading">Loading…</div>}

        {/* ════ DASHBOARD ════ */}
        {tab === "dashboard" && stats && (
          <div>
            <h1 className="page-title">Dashboard</h1>
            <div className="stat-grid">
              {[
                {
                  label: "Total Revenue",
                  value: `₹${stats.totalRevenue?.toLocaleString("en-IN")}`,
                  icon: "💰",
                },
                { label: "Total Orders", value: stats.totalOrders, icon: "📦" },
                { label: "Total Users", value: stats.totalUsers, icon: "👥" },
                {
                  label: "Total Products",
                  value: stats.totalProducts,
                  icon: "👗",
                },
              ].map(({ label, value, icon }) => (
                <div className="stat-card" key={label}>
                  <span className="stat-icon">{icon}</span>
                  <div>
                    <p className="stat-value">{value}</p>
                    <p className="stat-label">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="section-title">Orders by Status</h2>
            <div className="status-grid">
              {stats.ordersByStatus &&
                Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div
                    className="status-card"
                    key={status}
                    style={{ borderColor: STATUS_COLORS[status] }}
                  >
                    <p
                      className="status-count"
                      style={{ color: STATUS_COLORS[status] }}
                    >
                      {count}
                    </p>
                    <p className="status-name">{status}</p>
                  </div>
                ))}
            </div>

            <h2 className="section-title">Last 7 Days Revenue</h2>
            <div className="chart-wrap">
              {stats.revenueChart?.map(({ label, revenue }) => {
                const max = Math.max(
                  ...stats.revenueChart.map((r) => r.revenue),
                  1,
                );
                return (
                  <div className="bar-col" key={label}>
                    <span className="bar-val">
                      {revenue > 0 ? `₹${(revenue / 1000).toFixed(1)}k` : "₹0"}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${(revenue / max) * 100}%` }}
                      />
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ ORDERS ════ */}
        {tab === "orders" && (
          <div>
            <h1 className="page-title">Orders ({orders.length})</h1>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                      <td>
                        <p>{o.customer?.name}</p>
                        <small>{o.customer?.email}</small>
                      </td>
                      <td>{o.items?.length} item(s)</td>
                      <td>₹{o.totalAmount?.toLocaleString("en-IN")}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: "#f0f0f0", color: "#333" }}
                        >
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: STATUS_COLORS[o.orderStatus] + "22",
                            color: STATUS_COLORS[o.orderStatus],
                          }}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          className="status-select"
                        >
                          {[
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ PRODUCTS ════ */}
        {tab === "products" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Products ({products.length})</h1>
              <button
                className="add-btn"
                onClick={() => {
                  setProductForm(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                }}
              >
                + Add Product
              </button>
            </div>

            {showForm && (
              <div className="product-form">
                <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
                <div className="form-grid">
                  {[
                    { name: "name", placeholder: "Product Name", type: "text" },
                    { name: "price", placeholder: "Price (₹)", type: "number" },
                    {
                      name: "stockQuantity",
                      placeholder: "Stock Quantity",
                      type: "number",
                    },
                    {
                      name: "type",
                      placeholder: "Type (e.g. shirt)",
                      type: "text",
                    },
                    {
                      name: "subCategory",
                      placeholder: "Sub Category",
                      type: "text",
                    },
                    {
                      name: "sizes",
                      placeholder: "Sizes: S, M, L, XL",
                      type: "text",
                    },
                    {
                      name: "images",
                      placeholder: "Image URLs (comma separated)",
                      type: "text",
                    },
                    {
                      name: "description",
                      placeholder: "Description",
                      type: "text",
                    },
                  ].map(({ name, placeholder, type }) => (
                    <input
                      key={name}
                      type={type}
                      placeholder={placeholder}
                      value={productForm[name]}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          [name]: e.target.value,
                        })
                      }
                    />
                  ))}

                  {/* ← FIXED DROPDOWN */}
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleProductSubmit}>
                    {editingId ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    className="cancel-form-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.images?.[0] || ""}
                          alt={p.name}
                          className="product-thumb"
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.type}</td>
                      <td>{p.category?.name || p.category}</td>
                      <td>₹{p.price?.toLocaleString("en-IN")}</td>
                      <td>{p.stockQuantity}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => editProduct(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="del-btn"
                          onClick={() => deleteProduct(p._id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ USERS ════ */}
        {tab === "users" && (
          <div>
            <h1 className="page-title">Users ({users.length})</h1>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        {u.firstName} {u.lastName}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              u.isActive !== false ? "#e8f8ee" : "#fdeaea",
                            color: u.isActive !== false ? "#1a7a40" : "#c02020",
                          }}
                        >
                          {u.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={
                            u.isActive !== false ? "del-btn" : "edit-btn"
                          }
                          onClick={() => toggleUser(u._id)}
                        >
                          {u.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
