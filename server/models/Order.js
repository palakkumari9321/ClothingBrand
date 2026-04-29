import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: String,
  price: Number,
  image: String,
  qty: Number,
  size: String,
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],

    subtotal: Number,
    deliveryCharge: Number,
    totalAmount: Number,

    paymentMethod: {
      type: String,
      enum: ["COD", "STRIPE"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },

    customer: {
      name: String,
      phone: String,
      address: String,
    },

    stripeSessionId: String,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
