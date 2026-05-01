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

// ════════════════════════════════════════════════════════════
//  1. SMS
// ════════════════════════════════════════════════════════════
async function sendOrderSMS(order) {
  console.log("📱 SMS sent:", order.customerPhone);
  const message = `
🎉 Order Confirmed!
Order ID  : #${order.id.toString().slice(-6).toUpperCase()}
Items     : ${order.items.join(", ")}
Total     : ₹${order.total}
Delivery  : ${order.deliveryDate}
Track: ${order.trackingUrl}
Thank you for shopping with Everwear! 🛍️
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
        Namaste! Aapka Everwear order confirm ho gaya hai.
        Order ID hai number ${order.id.toString().slice(-6).toUpperCase().split("").join(" ")}.
        Aapki delivery ${order.deliveryDate} ko hogi.
        Dhanyavaad!
      </Say>
      <Pause length="1"/>
      <Say voice="alice">
        Hello! Your Everwear order has been confirmed.
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
//  3. EMAIL — Premium Beautiful Template
// ════════════════════════════════════════════════════════════
async function sendOrderEmail(order) {
  const isPaid = order.paymentMethod === "stripe";
  const orderId = order.id.toString().slice(-6).toUpperCase();

  const itemRows = order.itemDetails
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;">
          <span style="font-size:14px;color:#111827;font-weight:500;">● ${item.name}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;text-align:center;">
          <span style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:3px 10px;font-size:13px;color:#374151;">×${item.qty}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;text-align:right;">
          <span style="font-size:14px;font-weight:600;color:#111827;">₹${(item.price * item.qty).toLocaleString("en-IN")}</span>
        </td>
      </tr>
    `,
    )
    .join("");

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — Everwear</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'DM Sans',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- LOGO -->
        <tr>
          <td style="padding-bottom:24px;text-align:center;">
            <span style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;color:#111827;letter-spacing:3px;">EVERWEAR</span>
          </td>
        </tr>

        <!-- HERO DARK CARD -->
        <tr>
          <td style="background:#111827;border-radius:20px 20px 0 0;padding:48px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr><td style="width:72px;height:72px;background:rgba(255,255,255,0.1);border-radius:50%;text-align:center;vertical-align:middle;">
                <span style="font-size:32px;color:#fff;">✓</span>
              </td></tr>
            </table>
            <h1 style="margin:0 0 10px;font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;color:#FFFFFF;">Order Confirmed!</h1>
            <p style="margin:0 0 24px;font-size:16px;color:#9CA3AF;">Hey ${order.customerName}, your order is on its way 🎉</p>
            <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:8px 24px;font-size:13px;color:#E5E7EB;letter-spacing:1px;font-weight:600;">
              ORDER #${orderId}
            </span>
          </td>
        </tr>

        <!-- PAYMENT BANNER -->
        <tr>
          <td style="background:${isPaid ? "#ECFDF5" : "#FFFBEB"};border-left:4px solid ${isPaid ? "#10B981" : "#F59E0B"};padding:14px 24px;">
            <span style="font-size:14px;font-weight:600;color:${isPaid ? "#065F46" : "#92400E"};">
              ${isPaid ? "✅ Payment Successful via Stripe" : "🚚 Cash on Delivery — Please keep ₹" + order.total + " ready at delivery"}
            </span>
          </td>
        </tr>

        <!-- MAIN CARD -->
        <tr>
          <td style="background:#FFFFFF;border-radius:0 0 20px 20px;padding:32px 40px;">

            <!-- Meta Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="width:50%;padding-right:8px;">
                  <div style="background:#F9FAFB;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;font-weight:600;">Delivery Date</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">📅 ${order.deliveryDate}</p>
                  </div>
                </td>
                <td style="width:50%;padding-left:8px;">
                  <div style="background:#F9FAFB;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;font-weight:600;">Payment</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${isPaid ? "💳 Online Paid" : "💵 Cash on Delivery"}</p>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Address -->
            <div style="background:#F9FAFB;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;font-weight:600;">📍 Shipping Address</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${order.address}</p>
            </div>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;font-weight:600;">🛒 Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <thead>
                <tr style="background:#F9FAFB;">
                  <th style="padding:12px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;font-weight:600;">Product</th>
                  <th style="padding:12px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;font-weight:600;">Qty</th>
                  <th style="padding:12px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;font-weight:600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
                <tr style="background:#111827;">
                  <td colspan="2" style="padding:16px;font-size:15px;font-weight:700;color:#FFFFFF;">Total Amount</td>
                  <td style="padding:16px;text-align:right;font-size:18px;font-weight:700;color:#FFFFFF;">₹${Number(order.total).toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <!-- Track Button -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${order.trackingUrl}"
                 style="display:inline-block;background:#111827;color:#FFFFFF;text-decoration:none;padding:15px 44px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                Track My Order →
              </a>
            </div>

            <div style="border-top:1px solid #F3F4F6;margin-bottom:20px;"></div>

            <p style="margin:0;text-align:center;font-size:13px;color:#9CA3AF;line-height:1.7;">
              Questions? Reply to this email anytime.<br/>
              We typically respond within 2–4 hours.
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:28px 0;text-align:center;">
            <p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#111827;font-weight:700;letter-spacing:2px;">EVERWEAR</p>
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.8;">
              Thank you for shopping with us ❤️<br/>
              © ${new Date().getFullYear()} Everwear. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: `"Everwear" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ Order #${orderId} Confirmed — Everwear`,
      html: htmlBody,
    });

    console.log(`✅ Email sent | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Email failed:", err.message);
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
