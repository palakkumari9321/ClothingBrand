import React, { useEffect, useState, useMemo } from "react";
import "./Collection.css";
import { useNavigate } from "react-router-dom";

const PRODUCTS_PER_PAGE = 12;

function Collection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  const navigate = useNavigate();

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8082/product");
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // RESET PAGE ON FILTER CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortOrder]);

  // FILTER + SEARCH + SORT
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeFilter !== "all") {
      result = result.filter(
        (item) =>
          item.category?.name?.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (sortOrder === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeFilter, searchQuery, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const visiblePages = 5;
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  if (loading) return <p className="col-loader">Loading...</p>;

  return (
    <div className="col-page">
      {/* HEADER */}
      <div className="col-header">
        <h1>All Products</h1>
        <p>{filteredProducts.length} items found</p>
      </div>

      {/* CONTROLS */}
      <div className="col-controls">
        {/* FILTER */}
        <div className="col-filters">
          {["all", "men", "women", "kids"].map((f) => (
            <button
              key={f}
              className={activeFilter === f ? "active" : ""}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SEARCH + SORT */}
        <div className="col-actions">
          <input
            type="text"
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sort</option>
            <option value="low-high">Price ↑</option>
            <option value="high-low">Price ↓</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="col-grid">
        {currentProducts.map((item) => (
          <div
            key={item._id}
            className="col-card"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <div className="col-img">
              <img src={item.images?.[0]} alt={item.name} />
              <span className="col-overlay">View</span>
            </div>

            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="col-pagination">
          <button
            onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(endPage - startPage + 1)].map((_, i) => {
            const page = startPage + i;
            return (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Collection;
