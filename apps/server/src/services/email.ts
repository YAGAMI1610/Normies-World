// apps/server/src/services/notifications/email.ts
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const smtpPort = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

interface EmailPayload {
  to: string;
  subject: string;
  body?: string;
  html?: string;
}

export async function sendEmailAlert({ to, subject, body, html }: EmailPayload): Promise<boolean> {
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
      text: body ?? html?.replace(/<[^>]*>/g, " ") ?? "",
      html: html ?? `<p>${body ?? ""}</p>`,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
