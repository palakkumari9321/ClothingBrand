import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true },
); //STRUCTURE OD DATABASE

const UserModel = mongoose.model("user", UserSchema); //MODEL CREATE
export default UserModel; //USE ANOTHER FILE
