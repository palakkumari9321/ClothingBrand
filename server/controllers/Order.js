import Order from "../models/Order.js";
import Stripe from "stripe";
import { onOrderConfirmed } from "../services/OrderNotification.js";

const getDeliveryCharge = (subtotal) => (subtotal > 0 ? 50 : 0);

// ─────────────────────────────────────────
// Helper — Estimated delivery date
// ─────────────────────────────────────────
const getEstimatedDelivery = (daysFromNow = 4) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const mapCartItems = (cart) =>
  cart.map((item) => ({
    product: item._id,
    name: item.name,
    price: item.price,
    image: item.images?.[0] || item.image || "",
    qty: item.qty || 1,
    size: item.selectedSize || "",
  }));

//  COD ORDER
export const placeOrderCOD = async (req, res) => {
  try {
    const { cart, name, phone, address, email } = req.body;

    if (!cart || cart.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!name || !phone || !address)
      return res.status(400).json({ message: "Missing delivery details" });

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
    const deliveryCharge = getDeliveryCharge(subtotal);
    const totalAmount = subtotal + deliveryCharge;

    const order = await new Order({
      items: mapCartItems(cart),
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      customer: { name, phone, address, email },
    }).save();

    // Fire-and-forget notification
    onOrderConfirmed({
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
      total: totalAmount,
      address,
      paymentMethod: "cod",
      deliveryDate: getEstimatedDelivery(),
      trackingUrl: `${process.env.CLIENT_URL}/track/${order._id}`,
    }).catch((err) => console.error("🔴 COD notification error:", err));

    return res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("COD ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
// 💳 STRIPE — Session banao
// ════════════════════════════════════════
export const createStripeSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { cart, name, phone, address, email } = req.body;

    if (!cart || cart.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
    const deliveryCharge = getDeliveryCharge(subtotal);
    const totalAmount = subtotal + deliveryCharge;

    // Step 1: Pending order save karo
    const order = await new Order({
      items: mapCartItems(cart),
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: "STRIPE",
      paymentStatus: "pending",
      customer: {
        name: name || "",
        phone: phone || "",
        address: address || "",
        email: email || "",
      },
    }).save();

    // Step 2: Stripe line items
    const line_items = [
      ...cart.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name || "Product" },
          unit_amount: Math.round((item.price || 0) * 100),
        },
        quantity: item.qty || 1,
      })),
      ...(deliveryCharge > 0
        ? [
            {
              price_data: {
                currency: "inr",
                product_data: { name: "Delivery Charge" },
                unit_amount: deliveryCharge * 100,
              },
              quantity: 1,
            },
          ]
        : []),
    ];

    // Step 3: Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        orderId: order._id.toString(),
        customerName: name || "",
        customerPhone: phone || "",
        customerEmail: email || "",
        customerAddress: address || "",
        total: totalAmount.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ════════════════════════════════════════
// 🔔 STRIPE WEBHOOK
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
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "paid", stripeSessionId: session.id },
        { new: true },
      );

      console.log("✅ Order marked paid:", orderId);

      if (updatedOrder) {
        const meta = session.metadata;

        onOrderConfirmed({
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
        }).catch((err) => console.error("🔴 Stripe notification error:", err));
      }
    }
  }

  return res.json({ received: true });
};

// ════════════════════════════════════════
// 📦 GET MY ORDERS — Email se fetch
// ════════════════════════════════════════
export const getMyOrders = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const orders = await Order.find({
      "customer.email": email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ════════════════════════════════════════
// ❌ CANCEL ORDER
// ════════════════════════════════════════
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "processing")
      return res.status(400).json({
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}`,
      });

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body?.reason || "Cancelled by customer";

    await order.save();

    return res
      .status(200)
      .json({ message: "Order cancelled successfully", order });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ message: "Invalid order ID" });

    console.error("cancelOrder error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
