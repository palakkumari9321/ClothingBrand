import React, { useEffect, useState } from "react";
import { useParams, Link, NavLink } from "react-router-dom";
import "./Kids.css";

function Kids() {
  const { type, sub } = useParams();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const formatType = (val) => {
    if (!val) return "All";
    return val.charAt(0).toUpperCase() + val.slice(1);
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
        const all = data?.data || [];
        const kids = all.filter(
          (item) => item?.category?.name?.toLowerCase() === "kids",
        );
        setProducts(kids);
      })
      .catch((err) => console.log(err));
  }, []);

  const clean = (str) => str?.toLowerCase().replace(/[^a-z]/g, "");

  useEffect(() => {
    if (!type && !sub) {
      setFiltered(products);
      return;
    }
    const data = products.filter((item) => {
      const matchSub = sub ? clean(item.subCategory) === clean(sub) : true;
      const matchType = type ? clean(item.type) === clean(type) : true;
      return matchSub && matchType;
    });
    setFiltered(data);
  }, [type, sub, products]);

  return (
    <div className="collection">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/kids">Kids</Link>
        {sub && (
          <>
            {" "}
            / <span>{formatType(sub)}</span>
          </>
        )}
        {type && (
          <>
            {" "}
            / <span>{formatType(type)}</span>
          </>
        )}
      </div>

      {/* Menu */}
      <div className="category-menu">
        <NavLink to="/kids">All</NavLink>
        <NavLink to="/kids/boys/tshirts">Boys T-Shirts</NavLink>
        <NavLink to="/kids/boys/shirts">Boys Shirts</NavLink>
        <NavLink to="/kids/boys/jeans">Boys Jeans</NavLink>
        <NavLink to="/kids/boys/shorts">Boys Shorts</NavLink>
        <NavLink to="/kids/boys/shoes">Boys Shoes</NavLink>
        <NavLink to="/kids/girls/dresses">Girls Dresses</NavLink>
        <NavLink to="/kids/girls/tops">Girls Tops</NavLink>
        <NavLink to="/kids/girls/skirts">Girls Skirts</NavLink>
        <NavLink to="/kids/girls/leggings">Girls Leggings</NavLink>
        <NavLink to="/kids/girls/sandals">Girls Sandals</NavLink>
        <NavLink to="/kids/baby/clothing">Baby Clothing</NavLink>
        <NavLink to="/kids/baby/toys">Baby Toys</NavLink>
        <NavLink to="/kids/baby/essentials">Essentials</NavLink>
      </div>

      {/* Products */}
      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Link to={`/product/${item._id}`} className="card" key={item._id}>
              {/* Wishlist Button */}
              <button
                className={`wishlist-btn ${isWishlisted(item._id) ? "wishlisted" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item);
                }}
              >
                {isWishlisted(item._id) ? "♥" : "♡"}
              </button>

              <div className="img-box">
                <img
                  src={
                    Array.isArray(item.images) ? item.images[0] : item.images
                  }
                  alt={item.name}
                />
              </div>

              <div className="info">
                <h4 className="name">{item.name}</h4>
                <p className="desc">{item.description?.slice(0, 50)}...</p>
                <h3 className="price">₹{item.price}</h3>
                {/* ✅ View Product Button Added */}
                <button className="view-btn">View Product</button>
              </div>
            </Link>
          ))
        ) : (
          <h3 className="no-product">No Products Found</h3>
        )}
      </div>
    </div>
  );
}

export default Kids;
