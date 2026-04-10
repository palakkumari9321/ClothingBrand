import express from "express";
import mongoose from "mongoose"; //MONGOdB COONECT AND HANDLE
import cors from "cors"; //ALLOW FROENTEND CAN  TALK TO BACKEND
import dotenv from "dotenv"; //ENV VARIABLE READ KE LIYE
import {
  ChangePassword,
  EditProfile,
  GetAllUsers,
  Login,
  Register,
} from "./controllers/User.js";

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
try {
  await mongoose.connect(process.env.DB_URL);
  console.log("✅ MongoDB Connected");
} catch (error) {
  console.log("❌ DB Error:", error.message);
}

//user module
app.post("/register", Register);
app.post("/login", Login);
app.put("/editProfile", EditProfile);
app.put("/changePassword", ChangePassword);
app.get("/getUsers", GetAllUsers);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Port
const PORT = process.env.PORT || 8082;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
