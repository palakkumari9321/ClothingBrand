import mongoose, { Schema } from "mongoose";
const CategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
