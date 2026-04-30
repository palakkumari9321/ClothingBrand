import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [menu, setMenu] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchText.trim() === "") {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:8082/product/search?query=${searchText}`,
        );
        const data = await res.json();
        if (data.data) setResults(data.data);
        else setResults([]);
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchSearch();
  }, [searchText]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchText("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    setSearchText("");
    setResults([]);
  };

  // ✅ Ab saare results wale page pe jaayega
  const handleResultClick = () => {
    navigate(`/search?query=${searchText}`);
    setSearchOpen(false);
    setSearchText("");
    setResults([]);
  };

  // ✅ Enter press pe bhi same page
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      navigate(`/search?query=${searchText}`);
      setSearchOpen(false);
      setSearchText("");
      setResults([]);
    }
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link
          to="/home"
          style={{ textDecoration: "none", color: "rgb(11, 120, 153)" }}
        >
          <h1>Everwear</h1>
        </Link>
      </div>

      {/* NAV */}
      <nav className="nav">
        <Link to="/home">Home</Link>

        {/* MEN */}
        <div
          className="nav-item"
          onMouseEnter={() => setMenu("men")}
          onMouseLeave={() => setMenu("")}
        >
          <Link to="/men">Men</Link>
          {menu === "men" && (
            <div className="mega-menu">
              <div className="column">
                <h4>Topwear</h4>
                <Link to="/men/tshirts">T-Shirts</Link>
                <Link to="/men/shirts">Casual Shirts</Link>
                <Link to="/men/shirts">Formal Shirts</Link>
                <Link to="/men/sweatshirts">Sweatshirts</Link>
                <Link to="/men/jackets">Jackets</Link>
                <Link to="/men/blazers">Blazers</Link>
                <Link to="/men/suits">Suits</Link>
              </div>
              <div className="column">
                <h4>Bottomwear</h4>
                <Link to="/men/jeans">Jeans</Link>
                <Link to="/men/trousers">Trousers</Link>
                <Link to="/men/shorts">Shorts</Link>
                <Link to="/men/trackpants">Track Pants</Link>
              </div>
              <div className="column">
                <h4>Footwear</h4>
                <Link to="/men/shoes">Casual Shoes</Link>
                <Link to="/men/shoes">Sports Shoes</Link>
                <Link to="/men/sandals">Sandals</Link>
                <Link to="/men/flipflops">Flip Flops</Link>
              </div>
              <div className="column">
                <h4>Accessories</h4>
                <Link to="/men/watches">Watches</Link>
                <Link to="/men/wallets">Wallets</Link>
                <Link to="/men/belts">Belts</Link>
                <Link to="/men/sunglasses">Sunglasses</Link>
              </div>
            </div>
          )}
        </div>

        {/* WOMEN */}
        <div
          className="nav-item"
          onMouseEnter={() => setMenu("women")}
          onMouseLeave={() => setMenu("")}
        >
          <Link to="/women">Women</Link>
          {menu === "women" && (
            <div className="mega-menu">
              <div className="column">
                <h4>Topwear</h4>
                <Link to="/women/tops">Tops</Link>
                <Link to="/women/kurtis">Kurtis</Link>
                <Link to="/women/tshirts">T-Shirts</Link>
                <Link to="/women/shirts">Shirts</Link>
              </div>
              <div className="column">
                <h4>Bottomwear</h4>
                <Link to="/women/jeans">Jeans</Link>
                <Link to="/women/skirts">Skirts</Link>
                <Link to="/women/leggings">Leggings</Link>
                <Link to="/women/palazzo">Palazzo</Link>
              </div>
              <div className="column">
                <h4>Ethnic</h4>
                <Link to="/women/saree">Sarees</Link>
                <Link to="/women/suits">Suits</Link>
                <Link to="/women/lehenga">Lehenga</Link>
              </div>
              <div className="column">
                <h4>Footwear</h4>
                <Link to="/women/heels">Heels</Link>
                <Link to="/women/flats">Flats</Link>
                <Link to="/women/sneakers">Sneakers</Link>
              </div>
            </div>
          )}
        </div>

        {/* KIDS */}
        <div
          className="nav-item"
          onMouseEnter={() => setMenu("kids")}
          onMouseLeave={() => setMenu("")}
        >
          <Link to="/kids">Kids</Link>
          {menu === "kids" && (
            <div className="mega-menu">
              <div className="column">
                <h4>Boys</h4>
                <Link to="/kids/boys/tshirts">T-Shirts</Link>
                <Link to="/kids/boys/shirts">Shirts</Link>
                <Link to="/kids/boys/jeans">Jeans</Link>
                <Link to="/kids/boys/shorts">Shorts</Link>
                <Link to="/kids/boys/shoes">Shoes</Link>
              </div>
              <div className="column">
                <h4>Girls</h4>
                <Link to="/kids/girls/dresses">Dresses</Link>
                <Link to="/kids/girls/tops">Tops</Link>
                <Link to="/kids/girls/skirts">Skirts</Link>
                <Link to="/kids/girls/leggings">Leggings</Link>
                <Link to="/kids/girls/sandals">Sandals</Link>
              </div>
              <div className="column">
                <h4>Baby</h4>
                <Link to="/kids/baby/clothing">Clothing</Link>
                <Link to="/kids/baby/toys">Toys</Link>
                <Link to="/kids/baby/essentials">Essentials</Link>
              </div>
            </div>
          )}
        </div>

        <Link to="/collection">Collection</Link>
        <Link to="/trends">Trends</Link>
        <Link to ="/orders">Orders</Link>
      </nav>

      {/* RIGHT ICONS */}
      <div className="right">
        <div className="search-wrapper" ref={searchRef}>
          <span className="search-icon" onClick={handleSearchToggle}>
            🔍
          </span>

          {searchOpen && (
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown} // ✅ Enter press support
              autoFocus
            />
          )}

          {/* SEARCH RESULTS DROPDOWN */}
          {searchOpen && searchText && (
            <div className="search-result">
              {results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={item._id}
                    className="search-item"
                    onClick={handleResultClick} // ✅ saare results page pe jaayega
                  >
                    <img src={item.images[0]} alt={item.name} width="40" />
                    <p>{item.name}</p>
                  </div>
                ))
              ) : (
                <p className="no-result">No result found</p>
              )}
            </div>
          )}
        </div>

        <Link to="/cart" style={{ textDecoration: "none" }}>
          🛒
        </Link>
        <Link to="/wishlist" style={{ textDecoration: "none" }}>
          ❤️
        </Link>
        <Link
          to="/login"
          style={{ textDecoration: "none" }}
          className="user-icon"
        >
          👤
        </Link>
      </div>
    </header>
  );
}

export default Header;
