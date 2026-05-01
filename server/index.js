import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import https from "https";

// Controllers
import { Login, Register } from "./controllers/User.js";

import {
  bulkCreateProducts,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
} from "./controllers/Product.js";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./controllers/Category.js";
import { isAdmin, isAuthenticated } from "./middleware/Auth.js";
import {
  cancelOrder,
  createStripeSession,
  getMyOrders,
  placeOrderCOD,
  stripeWebhook,
} from "./controllers/Order.js";

dotenv.config();

const app = express();
app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();

/* ================= USER ROUTES ================= */
app.post("/register", Register);
app.post("/login", Login);

/* ================= CATEGORY ROUTES ================= */
app.post("/category", createCategory);
app.get("/getcategory", getCategories);
app.get("/category/:id", getCategoryById);
app.put("/category/:id", updateCategory);
app.delete("/category/:id", deleteCategory);

/* ================= PRODUCT ROUTES ================= */
app.post("/product", createProduct);
app.post("/product/bulk", bulkCreateProducts);
app.get("/product/search", searchProducts);
app.get("/product", getAllProducts);
app.get("/product/:id", getProductById);
app.put("/product/:id", updateProduct);
app.delete("/product/:id", deleteProduct);

/* ================= Admin ROUTE ================= */
app.post("/product", isAuthenticated, isAdmin, createProduct);
app.delete("/product/:id", isAuthenticated, isAdmin, deleteProduct);

/* ================= Order Payment ROUTE ================= */
app.post("/cod", placeOrderCOD);
app.post("/stripe", createStripeSession);

app.get("/orders", getMyOrders);
app.put("/my-orders/:id/cancel", cancelOrder); // fix karo

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
