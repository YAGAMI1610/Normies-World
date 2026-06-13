"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailAlert = sendEmailAlert;
// apps/server/src/services/notifications/email.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../lib/env");
let transporter = null;
function getTransporter() {
    if (!env_1.env.SMTP_HOST)
        return null;
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: env_1.env.SMTP_PORT,
            secure: env_1.env.SMTP_PORT === 465,
            auth: env_1.env.SMTP_USER ? { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS } : undefined,
        });
    }
    return transporter;
}
async function sendEmailAlert(to, subject, body) {
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
    }
    catch (err) {
        console.error("[email] send failed:", err);
        return false;
    }
}
