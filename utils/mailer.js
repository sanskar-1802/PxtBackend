const nodemailer = require("nodemailer");
const logger = require("./logger");


console.log("SMTP CONFIG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? "SET" : "MISSING"
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT),   // 587
  secure: false,                         // ❗ MUST be false for Brevo
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
  // ❌ REMOVE TLS block completely
});

async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    logger.info("Email sent: " + info.response);
    return info;
  } catch (err) {
    logger.error("Email error:", err);
    throw err;
  }
}

module.exports = { sendMail };
