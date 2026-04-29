import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // sizes: {
    //   type: [String],
    //   enum: ["S", "M", "L", "XL"],
    //   default: [],
    // },
    sizes: {
      type: [String],
      default: [],
      validate: {
        validator: function (sizesArray) {
          // Agar sizes empty hain toh valid hai
          if (sizesArray.length === 0) return true;

          const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
          const shoeSizes = ["6", "7", "8", "9", "10", "11", "12"];
          const kidClothSizes = [
            "2-3Y",
            "4-5Y",
            "6-7Y",
            "8-9Y",
            "10-11Y",
            "12-13Y",
          ];
          const kidShoeSizes = [
            "UK6",
            "UK7",
            "UK8",
            "UK9",
            "UK10",
            "UK11",
            "UK12",
          ];
          const babySizes = [
            "0-3M",
            "3-6M",
            "6-9M",
            "9-12M",
            "12-18M",
            "18-24M",
          ];
          const otherSizes = ["Free Size", "One Size"];
          const allValidSizes = [
            ...clothingSizes,
            ...shoeSizes,
            ...otherSizes,
            ...kidClothSizes,
            ...kidShoeSizes,
            ...babySizes,
            ...otherSizes,
          ];

          return sizesArray.every((size) => allValidSizes.includes(size));
        },
        message:
          "Invalid size! Clothing: XS-XXL, Shoes: 6-12,Other: Free Size,Kids: 2-13Y, Baby: 0-24M",
      },
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
