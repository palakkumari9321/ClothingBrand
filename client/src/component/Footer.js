import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-section brand">
          <h2>Everwear</h2>
          <p>Upgrade your style with latest trends.</p>

          <div className="social">
            <span>📸</span>
            <span>📘</span>
            <span>🐦</span>
          </div>
        </div>

        {/* SHOP */}
        <div className="footer-section">
          <h4>Shop</h4>
          <Link to="/men">Men</Link>
          <Link to="/women">Women</Link>
          <Link to="/kids">Kids</Link>
          <Link to="/collection">Collection</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer-section">
          <h4>Support</h4>
          <p>Contact Us</p>
          <p>Returns</p>
          <p>Shipping</p>
          <p>FAQs</p>
        </div>

        {/* COMPANY */}
        <div className="footer-section">
          <h4>Company</h4>
          <p>About Us</p>
          <p>Careers</p>
          <p>Privacy Policy</p>
          <p>Terms</p>
        </div>
      </div>

      {/* DIVIDER */}
      <hr />

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>© 2026 Everwear STORE</p>

        {/* <div className="payment">
          <span>💳</span>
          <span>💰</span>
          <span>📱</span>
        </div> */}
      </div>
    </footer>
  );
}

export default Footer;
