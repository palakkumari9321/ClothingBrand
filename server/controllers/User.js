import UserModel from "../models/User.js";
import bcrypt from "bcrypt";

// REGISTER
export const Register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userInDb = await UserModel.findOne({ email });
    if (userInDb) {
      return res.status(400).json({ message: "User already exists!!" });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      ...req.body,
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      message: "User Registered Successfully ✅",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// LOGIN
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // JWT token mein role bhi daalo
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login Successful ✅",
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
