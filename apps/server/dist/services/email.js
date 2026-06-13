"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailAlert = sendEmailAlert;
// apps/server/src/services/notifications/email.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
function getTransporter() {
    if (!process.env.SMTP_HOST)
        return null;
    if (!transporter) {
        const smtpPort = Number(process.env.SMTP_PORT ?? 587);
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
    }
    return transporter;
}
async function sendEmailAlert({ to, subject, body, html }) {
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
    }
    catch (err) {
        console.error("[email] send failed:", err);
        return false;
    }
}
