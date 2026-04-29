import React, { useEffect, useState } from "react";
import { useParams, NavLink, Link } from "react-router-dom";
import "./Women.css";

function Women() {
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
    { key: "tops", label: "Tops" },
    { key: "kurtis", label: "Kurtis" },
    { key: "tshirts", label: "T-Shirts" },
    { key: "shirts", label: "Shirts" },
    { key: "jeans", label: "Jeans" },
    { key: "skirts", label: "Skirts" },
    { key: "leggings", label: "Leggings" },
    { key: "palazzo", label: "Palazzo" },
    { key: "saree", label: "Sarees" },
    { key: "suits", label: "Suits" },
    { key: "lehenga", label: "Lehenga" },
    { key: "heels", label: "Heels" },
    { key: "flats", label: "Flats" },
    { key: "sneakers", label: "Sneakers" },
  ];

  const formatType = (t) => {
    if (!t) return "All";
    return categories.find((c) => c.key === t)?.label || t;
  };

  // 🔹 WISHLIST LOGIC (same as men)
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

  // 🔹 FETCH PRODUCTS
  useEffect(() => {
    fetch("http://localhost:8082/product")
      .then((res) => res.json())
      .then((data) => {
        const all = data?.data || [];

        const womenProducts = all.filter(
          (item) => item?.category?.name?.toLowerCase() === "women",
        );

        setProducts(womenProducts);
      })
      .catch((err) => console.log(err));
  }, []);

  const clean = (str) => str?.toLowerCase().replace(/[^a-z]/g, "");

  // 🔹 FILTER
  useEffect(() => {
    if (!type) {
      setFiltered(products);
    } else {
      setFiltered(products.filter((item) => clean(item.type) === clean(type)));
    }
  }, [type, products]);

  return (
    <div className="collection">
      {/* 🔥 BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/women">Women</Link>
        {type && (
          <>
            {" "}
            / <span>{formatType(type)}</span>
          </>
        )}
      </div>

      {/* 🔥 CATEGORY MENU */}
      <div className="category-menu">
        <NavLink
          to="/women"
          end
          className={({ isActive }) => (isActive && !type ? "active" : "")}
        >
          All
        </NavLink>

        {categories.map((cat) => (
          <NavLink
            key={cat.key}
            to={`/women/${cat.key}`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {cat.label}
          </NavLink>
        ))}
      </div>

      {/* 🔥 PRODUCTS */}
      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div className="card" key={item._id}>
              {/* ❤️ Wishlist */}
              <button
                className={`wishlist-btn ${
                  isWishlisted(item._id) ? "wishlisted" : ""
                }`}
                onClick={() => toggleWishlist(item)}
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

export default Women;
