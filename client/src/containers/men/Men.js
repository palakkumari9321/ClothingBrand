import React, { useEffect, useState } from "react";
import { useParams, NavLink, Link } from "react-router-dom";
import "./Men.css";

function Men() {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const categories = [
    { key: "tshirts", label: "T-Shirts" },
    { key: "casualshirts", label: "Casual Shirts" },
    { key: "formalshirts", label: "Formal Shirts" },
    { key: "sweatshirts", label: "Sweatshirts" },
    { key: "jackets", label: "Jackets" },
    { key: "blazers", label: "Blazers" },
    { key: "suits", label: "Suits" },
    { key: "jeans", label: "Jeans" },
    { key: "trousers", label: "Trousers" },
    { key: "shorts", label: "Shorts" },
    { key: "trackpants", label: "Track Pants" },
    { key: "casualshoes", label: "Casual Shoes" },
    { key: "sportsshoes", label: "Sports Shoes" },
    { key: "sandals", label: "Sandals" },
    { key: "flipflops", label: "Flip Flops" },
    { key: "watches", label: "Watches" },
    { key: "wallets", label: "Wallets" },
    { key: "belts", label: "Belts" },
    { key: "sunglasses", label: "Sunglasses" },
  ];

  const formatType = (t) => {
    if (!t) return "All";
    return categories.find((c) => c.key === t?.toLowerCase())?.label || t;
  };

  const toggleWishlist = (item) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w._id === item._id);
      const updated = exists
        ? prev.filter((w) => w._id !== item._id)
        : [...prev, item];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (id) => wishlist.some((w) => w._id === id);

  useEffect(() => {
    fetch("http://localhost:8082/product")
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        const menProducts = allProducts.filter(
          (item) =>
            item.category?.toLowerCase?.() === "men" ||
            item.category?.name?.toLowerCase() === "men",
        );
        setProducts(menProducts);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!type) {
      setFiltered(products);
    } else {
      const clean = (str) => str?.toLowerCase().replace(/[^a-z]/g, "");
      setFiltered(products.filter((item) => clean(item.type) === clean(type)));
    }
  }, [type, products]);

  return (
    <div className="collection">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/men">Men</Link>
        {type && (
          <>
            {" "}
            / <span>{formatType(type)}</span>
          </>
        )}
      </div>

      <div className="category-menu">
        <NavLink
          to="/men"
          end
          className={({ isActive }) => (isActive && !type ? "active" : "")}
        >
          All
        </NavLink>
        {categories.map((cat) => (
          <NavLink
            key={cat.key}
            to={`/men/${cat.key}`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {cat.label}
          </NavLink>
        ))}
      </div>

      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div className="card" key={item._id}>
              <button
                className={`wishlist-btn ${isWishlisted(item._id) ? "wishlisted" : ""}`}
                onClick={() => toggleWishlist(item)}
                title={
                  isWishlisted(item._id)
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"
                }
              >
                {isWishlisted(item._id) ? "♥" : "♡"}
              </button>

              <Link to={`/product/${item._id}`}>
                <div className="img-box">
                  <img
                    src={
                      Array.isArray(item.images) ? item.images[0] : item.images
                    }
                    alt={item.name}
                  />
                </div>
              </Link>
              <div className="info">
                <h4 className="name">{item.name}</h4>
                <p className="desc">{item.description?.slice(0, 50)}...</p>
                <h3 className="price">₹{item.price}</h3>
                <Link to={`/product/${item._id}`}>
                  <button className="view-btn">View Product</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <h3 className="no-product">No Products Found</h3>
        )}
      </div>
    </div>
  );
}

export default Men;
