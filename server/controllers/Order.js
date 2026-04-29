import Order from "../models/Order.js";
import Stripe from "stripe";

// 🟢 COD ORDER
export const placeOrderCOD = async (req, res) => {
  try {
    const { cart, name, phone, address } = req.body;

    // ✅ validation
    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    if (!name || !phone || !address) {
      return res.status(400).json({ message: "Missing details" });
    }

    // ✅ safe subtotal
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * (item.qty || 1),
      0,
    );

    const deliveryCharge = subtotal > 499 ? 0 : 49;

    const order = new Order({
      items: cart.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || item.image,
        qty: item.qty || 1,
        size: item.selectedSize,
      })),

      subtotal,
      deliveryCharge,
      totalAmount: subtotal + deliveryCharge,
      paymentMethod: "COD",

      customer: { name, phone, address },
    });

    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.log("COD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// 💳 STRIPE
export const createStripeSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { cart } = req.body;

    console.log("Incoming Cart:", cart); // 🔥 debug

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name || "Product",
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.log("Stripe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
