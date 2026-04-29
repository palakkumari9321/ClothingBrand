import React, { useEffect, useState, useMemo } from "react";
import "./Collection.css";
import { useNavigate } from "react-router-dom";

const PRODUCTS_PER_PAGE = 10;

function Collection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  const navigate = useNavigate();

  // ✅ FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8082/product");
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortOrder]);

  // ✅ FILTER + SEARCH + SORT
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // CATEGORY FILTER
    if (activeFilter !== "all") {
      result = result.filter((item) => {
        const slug = item.category?.slug?.toLowerCase() || "";
        return slug === activeFilter;
      });
    }

    // SEARCH
    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // SORT
    if (sortOrder === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeFilter, searchQuery, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
    setSortOrder("default");
  };

  if (loading) {
    return <p className="col-loader">Loading...</p>;
  }

  return (
    <div className="col-page">
      {/* HEADER */}
      <div className="col-hero">
        <h1 className="col-title">Collection</h1>
        <p className="col-count">Showing {filteredProducts.length} products</p>
      </div>

      {/* CONTROLS */}
      <div className="col-controls">
        {/* FILTER */}
        <div className="col-filters">
          {["all", "men", "women", "kids"].map((f) => (
            <button
              key={f}
              className={`filter-pill ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SEARCH + SORT */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="col-search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="col-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="low-high">Low → High</option>
            <option value="high-low">High → Low</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS */}
      {currentProducts.length === 0 ? (
        <div className="col-empty">
          <p>No products found 😕</p>
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="col-grid">
          {currentProducts.map((item) => (
            <div
              key={item._id}
              className="col-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <div className="col-img-box">
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="col-overlay">Quick View</div>
              </div>

              <div className="col-info">
                <span className="col-type">{item.category?.name}</span>

                <h3 className="col-name">{item.name}</h3>

                <div className="col-footer">
                  <strong className="col-price">₹{item.price}</strong>

                  <button
                    className="col-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${item._id}`);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="col-pagination">
          <button
            className="pg-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pg-btn ${currentPage === p ? "pg-active" : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="pg-btn"
            onClick={() => handlePageChange(currentPage + 1)}
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
