import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Sale.css";
import { useNavigate } from "react-router-dom";

function Sale() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8082/product");

      // 👉 Random but limited (8 products)
      const shuffled = res.data.data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 8);

      // 👉 Add discount
      const saleItems = selected.map((p) => ({
        ...p,
        discount: Math.floor(Math.random() * 30) + 10, // 10–40%
      }));

      setProducts(saleItems);
    } catch (err) {
      console.log(err);
    }
  };

  const getFinalPrice = (price, discount) => {
    return Math.round(price - (price * discount) / 100);
  };

  return (
    <div className="sale">
      {/* 🔥 Banner */}
      <div className="sale-banner">
        <h1>🔥 Mega Sale</h1>
        <p>Limited time deals just for you</p>
      </div>

      {/* 🛍 Grid */}
      <div className="sale-grid">
        {products.map((item) => (
          <div
            key={item._id}
            className="sale-card"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <div className="img-box">
              <img src={item.images[0]} alt={item.name} />
              <span className="badge">{item.discount}% OFF</span>
            </div>

            <div className="info">
              <h4>{item.name}</h4>

              <div className="price">
                <span className="new">
                  ₹{getFinalPrice(item.price, item.discount)}
                </span>
                <span className="old">₹{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sale;
