import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ─── Twilio Client ──────────────────────────────────────────
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// ─── Nodemailer Transporter (Gmail) ─────────────────────────
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

//  1. SMS
async function sendOrderSMS(order) {
  console.log("📱 SMS sent:", order.customerPhone);
  const message = `
🎉 Order Confirmed!
Order ID  : #${order.id}
Items     : ${order.items.join(", ")}
Total     : ₹${order.total}
Delivery  : ${order.deliveryDate}
Track: ${order.trackingUrl}
Thank you!
  `.trim();

  try {
    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.customerPhone,
    });
    console.log(`✅ SMS sent | SID: ${sms.sid}`);
    return { success: true, sid: sms.sid };
  } catch (err) {
    console.error("❌ SMS failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  2. VOICE CALL
// ════════════════════════════════════════════════════════════
async function sendOrderCall(order) {
  const twiml = `
    <Response>
      <Pause length="1"/>
      <Say language="hi-IN" voice="Polly.Aditi">
        Namaste! Aapka order confirm ho gaya hai.
        Order ID hai number ${order.id.toString().split("").join(" ")}.
        Aapki delivery ${order.deliveryDate} ko hogi.
        Dhanyavaad!
      </Say>
      <Pause length="1"/>
      <Say voice="alice">
        Hello! Your order number ${order.id} has been confirmed.
        Total amount is Rupees ${order.total}.
        Expected delivery on ${order.deliveryDate}. Thank you!
      </Say>
    </Response>
  `.trim();

  try {
    const call = await twilioClient.calls.create({
      twiml,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.customerPhone,
    });
    console.log(`✅ Call sent | SID: ${call.sid}`);
    return { success: true, sid: call.sid };
  } catch (err) {
    console.error("❌ Call failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  3. EMAIL
// ════════════════════════════════════════════════════════════
async function sendOrderEmail(order) {
  const isPaid = order.paymentMethod === "stripe";

  const paymentBadge = isPaid
    ? `<span class="badge" style="background:#DCFCE7;color:#166534;">✓ Payment Successful</span>`
    : `<span class="badge" style="background:#FEF3C7;color:#92400E;">💰 Cash on Delivery</span>`;

  const paymentText = isPaid
    ? `Your payment has been successfully received via Stripe.`
    : `You have chosen Cash on Delivery. Please keep the amount ready at delivery.`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .body { padding: 20px; }
    .badge { border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: bold; display:inline-block; margin-bottom: 10px;}
    table { width:100%; border-collapse: collapse; margin-top:15px; }
    th, td { padding:10px; border-bottom:1px solid #eee; font-size:14px; }
    .total { font-weight:bold; color:#4F46E5; }
    .footer { text-align:center; font-size:12px; padding:15px; color:#888; }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h2>Order Confirmed 🎉</h2>
      <p>Hi ${order.customerName}</p>
    </div>

    <div class="body">
      ${paymentBadge}

      <p>${paymentText}</p>

      <table>
        <tr>
          <th>Order ID</th>
          <th>Delivery Date</th>
        </tr>
        <tr>
          <td>#${order.id}</td>
          <td>${order.deliveryDate}</td>
        </tr>
      </table>

      <h3>🛒 Product Details</h3>
      <table>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>

        ${order.itemDetails
          .map(
            (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${item.price}</td>
          </tr>
        `,
          )
          .join("")}

        <tr>
          <td colspan="2" class="total">Total</td>
          <td class="total">₹${order.total}</td>
        </tr>
      </table>

      <p><strong>Shipping Address:</strong><br>${order.address}</p>

      <p>
        <a href="${order.trackingUrl}">Track Order</a>
      </p>
    </div>

    <div class="footer">
      Thank you for shopping with us ❤️
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await emailTransporter.sendMail({
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order #${order.id} Confirmed`,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
//  MAIN — yahi function controller se call hoga
// ════════════════════════════════════════════════════════════
export async function onOrderConfirmed(order) {
  console.log(`\n📦 Sending notifications for Order #${order.id}...`);

  const [smsResult, callResult, emailResult] = await Promise.allSettled([
    sendOrderSMS(order),
    sendOrderCall(order),
    sendOrderEmail(order),
  ]);

  const summary = {
    orderId: order.id,
    sms:
      smsResult.status === "fulfilled"
        ? smsResult.value
        : { success: false, error: smsResult.reason },
    call:
      callResult.status === "fulfilled"
        ? callResult.value
        : { success: false, error: callResult.reason },
    email:
      emailResult.status === "fulfilled"
        ? emailResult.value
        : { success: false, error: emailResult.reason },
  };

  console.log("📊 Notification Summary:", JSON.stringify(summary, null, 2));
  return summary;
}

export { sendOrderSMS, sendOrderCall, sendOrderEmail };
