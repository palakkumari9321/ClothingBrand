import Order from "../models/Order.js";
import Stripe from "stripe";
import { onOrderConfirmed } from "../services/OrderNotification.js";

const getDeliveryCharge = (subtotal) => (subtotal > 0 ? 50 : 0);

// ════════════════════════════════════════
// 🟢 COD ORDER
// ════════════════════════════════════════
export const placeOrderCOD = async (req, res) => {
  try {
    const { cart, name, phone, address, email } = req.body; // ← email bhi lo

    if (!cart || cart.length === 0)
      return res.status(400).json({ message: "Cart empty" });

    if (!name || !phone || !address)
      return res.status(400).json({ message: "Missing delivery details" });

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
    const deliveryCharge = getDeliveryCharge(subtotal);

    const order = new Order({
      items: cart.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || item.image || "",
        qty: item.qty || 1,
        size: item.selectedSize || "",
      })),
      subtotal,
      deliveryCharge,
      totalAmount: subtotal + deliveryCharge,
      paymentMethod: "COD",
      paymentStatus: "pending",
      customer: { name, phone, address, email }, // ← email save karo
    });

    await order.save();

    // ✅ COD confirm hote hi — SMS + Call + Email bhejo
    const notifOrder = {
      id: order._id.toString(),
      customerName: name,
      customerPhone: phone.startsWith("+") ? phone : `+91${phone}`,
      customerEmail: email || "",
      items: cart.map((i) => i.name),
      itemDetails: cart.map((i) => ({
        name: i.name,
        qty: i.qty || 1,
        price: i.price,
      })),
      total: subtotal + deliveryCharge,
      address: address,
      deliveryDate: getEstimatedDelivery(), // helper neeche hai
      trackingUrl: `${process.env.CLIENT_URL}/track/${order._id}`,
    };

    // Fire-and-forget — response wait nahi karega
    onOrderConfirmed(notifOrder).catch((err) =>
      console.error("🔴 COD notification error:", err),
    );

    res.json({ success: true });
  } catch (err) {
    console.error("COD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ════════════════════════════════════════
// 💳 STRIPE — Save Order First, Then Session
// ════════════════════════════════════════
export const createStripeSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { cart, name, phone, address, email } = req.body; // ← email bhi lo

    if (!cart || cart.length === 0)
      return res.status(400).json({ error: "Cart empty" });

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
    const deliveryCharge = getDeliveryCharge(subtotal);

    // Step 1: Order DB mein save karo (pending)
    const order = new Order({
      items: cart.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || item.image || "",
        qty: item.qty || 1,
        size: item.selectedSize || "",
      })),
      subtotal,
      deliveryCharge,
      totalAmount: subtotal + deliveryCharge,
      paymentMethod: "STRIPE",
      paymentStatus: "pending",
      customer: {
        name: name || "",
        phone: phone || "",
        address: address || "",
        email: email || "", // ← email save karo
      },
    });

    await order.save();

    // Step 2: Line items
    const line_items = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name || "Product" },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

    if (deliveryCharge > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Delivery Charge" },
          unit_amount: deliveryCharge * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        orderId: order._id.toString(),
        // ⬇ Webhook mein customer data chahiye hoga notification ke liye
        customerName: name || "",
        customerPhone: phone || "",
        customerEmail: email || "",
        customerAddress: address || "",
        total: (subtotal + deliveryCharge).toString(),
      },
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ════════════════════════════════════════
// 🔔 STRIPE WEBHOOK — Payment ke baad order update + Notification
// ════════════════════════════════════════
export const stripeWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Step 1: Order paid mark karo
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "paid", stripeSessionId: session.id },
        { new: true }, // ← updated doc wapas lo
      );
      console.log("✅ Order marked paid:", orderId);

      // Step 2: ✅ Payment confirm hone ke BAAD notification bhejo
      if (updatedOrder) {
        const meta = session.metadata;

        const notifOrder = {
          id: orderId,
          customerName:
            meta.customerName || updatedOrder.customer?.name || "Customer",
          customerPhone:
            meta.customerPhone || updatedOrder.customer?.phone || "",
          customerEmail:
            meta.customerEmail || updatedOrder.customer?.email || "",
          items: updatedOrder.items.map((i) => i.name),
          itemDetails: updatedOrder.items.map((i) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          total: Number(meta.total) || updatedOrder.totalAmount,
          address: meta.customerAddress || updatedOrder.customer?.address || "",
          deliveryDate: getEstimatedDelivery(),
          trackingUrl: `${process.env.CLIENT_URL}/track/${orderId}`,
        };

        onOrderConfirmed(notifOrder).catch((err) =>
          console.error("🔴 Stripe notification error:", err),
        );
      }
    }
  }

  res.json({ received: true });
};

// ════════════════════════════════════════
// 🗓 Helper — Estimated delivery date
// ════════════════════════════════════════
function getEstimatedDelivery(daysFromNow = 4) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ════════════════════════════════════════
// 📦 MY ORDERS — Email se fetch
// ════════════════════════════════════════
export const getMyOrders = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required hai" });
    }

    const orders = await Order.find({ "customer.email": email }).sort({
      createdAt: -1,
    });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ════════════════════════════════════════
// ❌ CANCEL ORDER
// ════════════════════════════════════════
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order nahi mila" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cancel nahi ho sakta",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Pehle se cancel hai" });
    }

    if (order.paymentMethod === "STRIPE" && order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid order cancel nahi ho sakta. Support se contact karo.",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancel ho gaya" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
