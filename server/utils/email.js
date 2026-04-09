import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * SMTP_DRY_RUN=true — log emails to console only (local dev without Gmail).
 * Gmail: use an App Password (Google Account → Security → 2-Step Verification → App passwords),
 * not your normal password. Put it in EMAIL_PASS.
 * SMTP_VERIFY_ON_START=true — run connection check on server boot (optional).
 */
const dryRun = process.env.SMTP_DRY_RUN === "true";

function buildTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  // Gmail app passwords are often pasted with spaces; SMTP expects 16 chars without spaces.
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "").trim();

  if (!user || !pass) {
    return null;
  }

  const host = (process.env.SMTP_HOST || "").toLowerCase();
  const forceGmail = process.env.SMTP_SERVICE === "gmail" || host.includes("gmail");

  if (forceGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  });
}

let transporter;

function getTransporter() {
  if (dryRun) return null;
  if (!transporter) transporter = buildTransporter();
  return transporter;
}

export const sendEmail = async (to, subject, html) => {
  if (dryRun) {
    const preview = html.replace(/\s+/g, " ").slice(0, 280);
    console.log(`[SMTP_DRY_RUN] to=${to} subject=${subject}`);
    console.log(`[SMTP_DRY_RUN] ${preview}...`);
    return;
  }

  const tx = getTransporter();
  if (!tx) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_PASS in .env, or set SMTP_DRY_RUN=true for development."
    );
  }

  try {
    await tx.sendMail({
      from: `"ReNova Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err.message || err);
    if (err.code === "EAUTH" || err.responseCode === 534) {
      throw new Error(
        "SMTP sign-in failed. For Gmail: enable 2-Step Verification and create an App Password, then set EMAIL_PASS to that 16-character password (not your Gmail password)."
      );
    }
    throw new Error(err.message || "Failed to send email.");
  }
};

if (process.env.SMTP_VERIFY_ON_START === "true" && !dryRun) {
  const tx = getTransporter();
  tx?.verify((error) => {
    if (error) console.warn("SMTP verify failed:", error.message);
    else console.log("SMTP verify OK");
  });
}
