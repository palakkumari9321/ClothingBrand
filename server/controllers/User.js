import UserModel from "../models/User.js";

// REGISTER
export const Register = async (req, res) => {
  try {
    // check user exists
    let userInDb = await UserModel.findOne({
      email: req.body.email,
    });

    if (userInDb) {
      return res.status(400).send({ message: "User already exists!!" });
    }

    // create user
    let userData = await UserModel.create({
      ...req.body,
      profilePic: req?.file?.filename,
    });

    if (userData) {
      res.status(201).send({ message: "User Registered!!" });
    } else {
      res.status(400).send({ message: "Unable to create user!!!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
};

// LOGIN
export const Login = async (req, res) => {
  try {
    let userInDb = await UserModel.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (userInDb) {
      res.status(200).send({
        message: "Login Successful",
        id: userInDb._id,
        role: userInDb.role,
      });
    } else {
      return res.status(400).send({ message: "Wrong email or password!!!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
};

export const GetAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password"); // hide password

    res.status(200).json({
      totalUsers: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

export const EditProfile = async (req, res) => {
  try {
    const { id, firstName, lastName, email } = req.body;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // update fields only if provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // optional image
    if (req.file) {
      user.profilePic = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      message: "Profile Updated Successfully ✅",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword, confirmPassword } = req.body;

    // check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        message: "Passwords do not match",
      });
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    // check old password
    if (user.password !== oldPassword) {
      return res.status(400).send({
        message: "Old password incorrect",
      });
    }

    // update password
    user.password = newPassword;
    await user.save();

    res.status(200).send({
      message: "Password changed successfully ✅",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to change password",
    });
  }
};
