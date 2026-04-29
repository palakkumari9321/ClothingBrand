import React, { useContext, useState } from "react";

import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CartContext } from "../../context/CartContext";

const stripePromise = loadStripe(
  "pk_test_51TRYIKGw9HIvhyy5y9AE8Nddy8OnaSP8H3o9ssd9mcvOEm2EHOTPX3vQ89wYLDJTGqxoEgyQr7i1J4QKiEFf3VP800uZ7fjYMT",
);

function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Fill all details");
      return;
    }

    // 🟢 COD
    if (paymentMethod === "cod") {
      const res = await fetch("http://localhost:8082/cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          ...form,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully");
        setCart([]);
        navigate("/success");
      }
    }

    // 💳 STRIPE
    if (paymentMethod === "stripe") {
      const stripe = await stripePromise;

      const res = await fetch("http://localhost:8082/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          ...form,
        }),
      });

      const data = await res.json();

      await stripe.redirectToCheckout({
        sessionId: data.id,
      });
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Checkout</h2>

      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <br />
      <br />

      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <br />
      <br />

      <textarea name="address" placeholder="Address" onChange={handleChange} />
      <br />
      <br />

      <h3>Payment Method</h3>

      <label>
        <input
          type="radio"
          checked={paymentMethod === "cod"}
          onChange={() => setPaymentMethod("cod")}
        />
        Cash on Delivery
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={paymentMethod === "stripe"}
          onChange={() => setPaymentMethod("stripe")}
        />
        Pay Online (Stripe)
      </label>

      <br />
      <br />

      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
}

export default Checkout;
