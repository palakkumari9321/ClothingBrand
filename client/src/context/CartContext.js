import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ADD ITEM / INCREASE QTY
  const addToCart = (product) => {
    const exist = cart.find(
      (item) =>
        item._id === product._id && item.selectedSize === product.selectedSize,
    );

    if (exist) {
      setCart(
        cart.map((item) =>
          item._id === product._id && item.selectedSize === product.selectedSize
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // DECREASE
  const decreaseQty = (product) => {
    const exist = cart.find(
      (item) =>
        item._id === product._id && item.selectedSize === product.selectedSize,
    );

    if (exist.qty === 1) {
      removeFromCart(product);
    } else {
      setCart(
        cart.map((item) =>
          item._id === product._id && item.selectedSize === product.selectedSize
            ? { ...item, qty: item.qty - 1 }
            : item,
        ),
      );
    }
  };

  // REMOVE
  const removeFromCart = (product) => {
    setCart(
      cart.filter(
        (item) =>
          !(
            item._id === product._id &&
            item.selectedSize === product.selectedSize
          ),
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, decreaseQty, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
