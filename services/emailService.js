// server.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Choose which transport to use (587 or 465)
const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 587,          // Use 587 for STARTTLS (recommended)
  secure: false,      // false for 587, true for 465
  auth: {
    user: process.env.SMTP_USER || "support@coincarecenter.info",
    pass: process.env.SMTP_PASS, // Titan mailbox password
  },
  tls: {
    rejectUnauthorized: false, // helps if certificate issues occur
  },
});

// Test sending an email
async function sendTestMail() {
  try {
    console.log("SMTP user from env:", process.env.SMTP_USER);

    let info = await transporter.sendMail({
      from: `"CoinCare Center" <support@coincarecenter.info>`,
      to: "yourtestmail@example.com", // change to your test inbox
      subject: "SMTP Test",
      text: "This is a test email via Titan SMTP",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending mail:", error);
  }
}

sendTestMail();
