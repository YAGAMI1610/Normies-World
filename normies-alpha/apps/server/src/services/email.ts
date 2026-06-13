// apps/server/src/services/notifications/email.ts
import nodemailer from "nodemailer";
import { env } from "../../lib/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmailAlert(to: string, subject: string, body: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn("[email] SMTP not configured — skipping email to", to);
    return false;
  }
  try {
    await t.sendMail({
      from: `"Normies Alpha" <alerts@normies-alpha.app>`,
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
