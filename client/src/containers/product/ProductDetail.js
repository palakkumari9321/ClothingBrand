import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { CartContext } from "../../context/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8082/product/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.data);
        if (d.data?.images?.length > 0) setMainImage(d.data.images[0]);
      })
      .catch(console.error);
  }, [id]);

  const switchImage = (img, i) => {
    setMainImage(img);
    setActiveIdx(i);
    setImgKey((k) => k + 1);
  };
  const handleAddToCart = () => {
    if (!selectedSize) return;

    addToCart({ ...product, selectedSize });

    setAdded(true);

    // 🔥 redirect after small delay (UX smooth)
    setTimeout(() => {
      navigate("/"); // home page
    }, 800);
  };
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select size");
      return;
    }

    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      qty: 1,
      size: selectedSize,
    };

    // 🔥 IMPORTANT: separate store
    localStorage.setItem("buyNowItem", JSON.stringify([item]));

    navigate("/checkout?type=buynow");
  };

  if (!product)
    return (
      <div className="ew-loader">
        <div className="ew-spin" />
        <p>Loading…</p>
      </div>
    );

  return (
    <div className="ew-page">
      <div className="ew-card">
        {/* ═══ LEFT — GALLERY ═══ */}
        <div className="ew-gallery">
          {/* thumbnails */}
          <div className="ew-thumbs">
            {product.images?.map((img, i) => (
              <button
                key={i}
                className={`ew-thumb ${activeIdx === i ? "ew-thumb--on" : ""}`}
                onClick={() => switchImage(img, i)}
              >
                <img src={img} alt={`view-${i}`} draggable={false} />
              </button>
            ))}
          </div>

          {/* main */}
          <div className="ew-main-wrap">
            <img
              key={imgKey}
              src={mainImage}
              alt={product.name}
              className="ew-main-img"
              draggable={false}
            />
            <span className="ew-badge">NEW ✨</span>

            {/* wishlist floating */}
            <button
              className={`ew-float-wish ${wishlisted ? "ew-float-wish--on" : ""}`}
              onClick={() => setWishlisted((w) => !w)}
              aria-label="Wishlist"
            >
              <svg
                viewBox="0 0 24 24"
                fill={wishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                width="20"
                height="20"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                  a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                  1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ═══ RIGHT — DETAILS ═══ */}
        <div className="ew-info">
          <p className="ew-brand">Everwear Collection</p>
          <h1 className="ew-name">{product.name}</h1>

          {/* stars */}
          <div className="ew-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill={s <= 4 ? "#f5a623" : "none"}
                stroke="#f5a623"
                strokeWidth="1.5"
              >
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14
                  18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                />
              </svg>
            ))}
            <span className="ew-review-ct">128 reviews</span>
          </div>

          {/* price */}
          <div className="ew-price-row">
            <span className="ew-price">₹{product.price}</span>
            <span className="ew-mrp">₹{Math.round(product.price * 1.3)}</span>
            <span className="ew-off">30% OFF</span>
          </div>
          <p className="ew-tax">Inclusive of all taxes · Free delivery</p>

          <div className="ew-sep" />

          <p className="ew-desc">{product.description}</p>

          <div className="ew-sep" />

          {/* SIZE */}
          <div className="ew-size-hdr">
            <span className="ew-size-lbl">Select Size</span>
            <button className="ew-size-guide">Size Guide ↗</button>
          </div>

          <div className="ew-sizes">
            {product.sizes && product.sizes.length > 0 ? (
              product.sizes.map((s, i) => (
                <button
                  key={i}
                  className={`ew-sz ${selectedSize === s ? "ew-sz--on" : ""}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))
            ) : (
              <p>No size required</p>
            )}
          </div>
          {!selectedSize && (
            <p className="ew-sz-hint">Please select a size to continue</p>
          )}

          {/* CTA */}
          <div className="ew-cta-row">
            <button
              className={`ew-add-btn
                ${added ? "ew-add-btn--done" : ""}
                ${!selectedSize ? "ew-add-btn--off" : ""}`}
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              {added ? "✓  Added to Bag" : "Add to Bag"}
            </button>

            <button
              className={`ew-buy-btn ${!selectedSize ? "ew-buy-btn--off" : ""}`}
              onClick={handleBuyNow}
              disabled={!selectedSize}
            >
              Buy Now
            </button>
          </div>

          {/* perks */}
          <div className="ew-perks">
            {[
              { icon: "🚚", label: "Free Shipping", sub: "On all orders" },
              { icon: "↩", label: "Easy Returns", sub: "7-day policy" },
              { icon: "🔒", label: "Safe Payment", sub: "100% secure" },
            ].map((p) => (
              <div key={p.label} className="ew-perk">
                <span className="ew-perk-icon">{p.icon}</span>
                <p className="ew-perk-lbl">{p.label}</p>
                <p className="ew-perk-sub">{p.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
