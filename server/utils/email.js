import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ------------------------------------
// Create reusable transporter (Office365)
// ------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Gmail uses STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ------------------------------------
// Generic sendEmail function
// ------------------------------------
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"ReNova Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};


transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("✓ SMTP CONNECTED");
  }
});
