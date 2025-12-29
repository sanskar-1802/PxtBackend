const logger = require("./logger");

async function sendMail({ to, subject, text, html }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: html || `<p>${text}</p>`,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Email failed");

    logger.info("Email sent:", data);
    return data;
  } catch (err) {
    logger.error("Email error:", err);
    throw err;
  }
}

module.exports = { sendMail };
