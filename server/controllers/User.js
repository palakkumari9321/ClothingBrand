import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const JWT_SECRET = process.env.JWT_SECRET || "everwear_secret_key";
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

/* ═══════════════════════════════════════
   POST /register
═══════════════════════════════════════ */
export const Register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const userInDb = await UserModel.findOne({ email });
    if (userInDb)
      return res
        .status(400)
        .json({ success: false, message: "User already exists!!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      success: true, // ✅ ADDED
      message: "User Registered Successfully ✅",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ═══════════════════════════════════════
   POST /login
═══════════════════════════════════════ */
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });

    res.status(200).json({
      success: true, // ✅ ADDED
      message: "Login Successful ✅",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ═══════════════════════════════════════
   GET /api/auth/me
═══════════════════════════════════════ */
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ═══════════════════════════════════════
   GET /api/admin/users
═══════════════════════════════════════ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ═══════════════════════════════════════
   PUT /api/admin/users/:id/toggle
═══════════════════════════════════════ */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ═══════════════════════════════════════
   GET /api/admin/stats
═══════════════════════════════════════ */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      UserModel.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const ordersByStatus = {
      processing: orders.filter((o) => o.orderStatus === "processing").length,
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    });

    const revenueChart = last7Days.map((label) => {
      const dayOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return (
          d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) ===
            label && o.orderStatus !== "cancelled"
        );
      });
      return {
        label,
        revenue: dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
      };
    });

    return res.status(200).json({
      success: true,
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      ordersByStatus,
      revenueChart,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
