import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    return `${h}h ${m}m ${s}s`;
  };
  useEffect(() => {
    const saved = localStorage.getItem("trendingProducts");

    if (saved) {
      const data = JSON.parse(saved);

      const formatted = data.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: Array.isArray(item.images) ? item.images[0] : item.images,
        isNew: true, // optional
      }));

      setProducts(formatted);
    }
  }, []);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const marqueeItems = [
    "🚚 Free Delivery on ₹499+",
    "🔥 Up to 70% OFF on Sale",
    "✨ New Arrivals Every Week",
    "🔁 Easy 30-Day Returns",
  ];

  const brands = [
    "Nike",
    "H&M",
    "Levi's",
    "Zara",
    "Adidas",
    "Puma",
    "Mango",
    "US Polo",
    "Allen Solly",
    "Van Heusen",
  ];

  return (
    <div className="home">
      {/* ── 1. ANNOUNCEMENT MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 2. HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <span className="hero-badge">New Season 2026 ✦</span>
          <h1>
            Discover Your <br />
            Unique Style ✨
          </h1>
          <p>
            Upgrade your wardrobe with trendy collections made just for you.
          </p>
          <div className="hero-btns">
            <button
              className="btn-primary"
              onClick={() => navigate("/collection")}
            >
              Shop Now
            </button>
            <button className="btn-secondary" onClick={() => navigate("/sale")}>
              View Sale
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <strong>50K+</strong>
              <span>Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <strong>2M+</strong>
              <span>Customers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-left-col">
            <div className="hero-img-box small">
              <img
                src="https://tse2.mm.bing.net/th/id/OIP.rmEb2gc3USbhkdTWIkrOmAHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="style 1"
              />
            </div>
            <div className="hero-img-box small">
              <img
                src="https://th.bing.com/th/id/OIP.asbSVecBYc2sNW4Fklu4qwHaLH?w=208&h=305&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                alt="style 2"
              />
            </div>
          </div>
          <div className="hero-img-box big">
            <img
              src="https://tse4.mm.bing.net/th/id/OIP.YpiRo8rcwOT-VupoH0ihMgHaLH?r=0&pid=ImgDet&w=187&h=280&c=7&dpr=1.3&o=7&rm=3"
              alt="style 3"
            />
          </div>
        </div>
      </section>

      {/* ── 3. CATEGORY ── */}
      <section className="categories">
        <h2>Explore Categories</h2>
        <div className="cat-grid">
          <div className="cat-card" onClick={() => navigate("/men")}>
            👕 Men
          </div>
          <div className="cat-card" onClick={() => navigate("/women")}>
            👗 Women
          </div>
          <div className="cat-card" onClick={() => navigate("/kids")}>
            🧒 Kids
          </div>
        </div>
      </section>

      <section className="products">
        <div className="section-header">
          <h2>Trending Now 🔥</h2>
          <button className="view-all" onClick={() => navigate("/collection")}>
            View All →
          </button>
        </div>
        <div className="product-grid">
          {products.length > 0 ? (
            products.slice(0, 10).map((item) => (
              <div
                className="product-card"
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                {item.isNew && <span className="new-badge">New</span>}
                <div className="product-img-wrap">
                  <img src={item.image} alt={item.name} />
                  <div className="product-overlay">
                    <span>Quick View</span>
                  </div>
                </div>
                <p>{item.name}</p>
                <div className="rating">
                  ⭐ 4.{Math.floor(Math.random() * 5)} (
                  {Math.floor(Math.random() * 200)} reviews)
                </div>
                <span>₹{item.price}</span>
              </div>
            ))
          ) : (
            <p className="loading-text">Loading products...</p>
          )}
        </div>
      </section>

      {/* ── 5. OFFER BANNER ── */}
      <section className="offer">
        <div className="offer-content">
          <span className="offer-tag">Limited Time</span>
          <h2>Summer Sale ☀️</h2>
          <p>Flat 50% OFF on all items. Don't miss out!</p>
          <button onClick={() => navigate("/collection")}>Explore Now</button>
        </div>
        <div className="offer-decoration">
          <span>50%</span>
          <small>OFF</small>
        </div>
      </section>

      {/* ── 6. WHY US ── */}
      <section className="why">
        <div>
          <h4>🚚 Free Delivery</h4>
          <p>On all orders above ₹499</p>
        </div>
        <div>
          <h4>🔁 Easy Returns</h4>
          <p>7 days return policy</p>
        </div>
        <div>
          <h4>🔒 Secure Payment</h4>
          <p>100% safe transactions</p>
        </div>
        <div>
          <h4>🎁 Gift Wrapping</h4>
          <p>Available on all orders</p>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-inner">
          <h2>Stay in the Loop 📩</h2>
          <p>Subscribe for exclusive deals, new arrivals & style tips.</p>
          {subscribed ? (
            <div className="subscribed-msg">
              🎉 Thank you! You're now subscribed.
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      {/* ── 10. BACK TO TOP BUTTON (NEW) ── */}
      {showTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          title="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Home;
