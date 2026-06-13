"use strict";
// apps/server/src/services/notificationDispatcher.ts
// Dispatches alert notifications to all subscribed channels:
//   in-app (stored in Notification table, served via /api/alerts)
//   email   (nodemailer)
//   telegram (bot sendMessage)
//   discord (webhook POST)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchAlert = dispatchAlert;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const email_1 = require("./email");
// ── In-App ──────────────────────────────────────────────────────────────────
async function dispatchInApp(alert) {
    // Find all users who have inapp subscribed for this alert type
    const prefs = await prisma_1.prisma.alertPreference.findMany({
        where: {
            type: alert.type,
            channels: { has: 'inapp' },
        },
        select: { userId: true },
    });
    if (prefs.length === 0)
        return;
    await prisma_1.prisma.notification.createMany({
        data: prefs.map(p => ({
            userId: p.userId,
            alertId: alert.id,
            channel: 'inapp',
            status: 'sent',
            sentAt: new Date(),
        })),
        skipDuplicates: true,
    });
}
// ── Email ────────────────────────────────────────────────────────────────────
async function dispatchEmail(alert) {
    if (!process.env.SMTP_HOST)
        return;
    const prefs = await prisma_1.prisma.alertPreference.findMany({
        where: { type: alert.type, channels: { has: 'email' } },
        include: { user: { select: { id: true, email: true } } },
    });
    for (const pref of prefs) {
        if (!pref.user.email)
            continue;
        try {
            await (0, email_1.sendEmailAlert)({
                to: pref.user.email,
                subject: `Normies Alpha Alert: ${alert.type.replace(/_/g, ' ')}`,
                html: `
          <div style="font-family:monospace;background:#080B12;color:#D6E4FF;padding:24px;border-radius:12px">
            <h2 style="color:#5B6EFF;margin:0 0 12px">⚡ Normies Alpha Alert</h2>
            <p style="font-size:16px;margin:0 0 16px">${alert.message}</p>
            <p style="color:#8A9BC0;font-size:12px">Severity: ${alert.severity} · Type: ${alert.type}</p>
            <hr style="border-color:#1A2035;margin:16px 0"/>
            <p style="color:#8A9BC0;font-size:11px">
              Manage alert preferences at <a href="https://normies-alpha.xyz/profile" style="color:#5B6EFF">normies-alpha.xyz</a>
            </p>
          </div>`,
            });
            await prisma_1.prisma.notification.create({
                data: {
                    userId: pref.userId,
                    alertId: alert.id,
                    channel: 'email',
                    status: 'sent',
                    sentAt: new Date(),
                },
            });
        }
        catch (err) {
            console.error('[notificationDispatcher] email failed:', err);
            await prisma_1.prisma.notification.create({
                data: {
                    userId: pref.userId,
                    alertId: alert.id,
                    channel: 'email',
                    status: 'failed',
                },
            });
        }
    }
}
// ── Telegram ─────────────────────────────────────────────────────────────────
async function dispatchTelegram(alert) {
    if (!process.env.TELEGRAM_BOT_TOKEN)
        return;
    const prefs = await prisma_1.prisma.alertPreference.findMany({
        where: { type: alert.type, channels: { has: 'telegram' } },
        include: { user: { select: { id: true, telegramChatId: true } } },
    });
    for (const pref of prefs) {
        if (!pref.user.telegramChatId)
            continue;
        try {
            await axios_1.default.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: pref.user.telegramChatId,
                text: `⚡ *Normies Alpha Alert*\n\n${alert.message}\n\n_${alert.type} · ${alert.severity}_`,
                parse_mode: 'Markdown',
            });
        }
        catch (err) {
            console.error('[notificationDispatcher] telegram failed:', err);
        }
    }
}
// ── Discord ──────────────────────────────────────────────────────────────────
async function dispatchDiscord(alert) {
    if (!process.env.DISCORD_WEBHOOK_URL)
        return;
    const color = alert.severity === 'critical' ? 0xff4d6a :
        alert.severity === 'warning' ? 0xffb547 : 0x5b6eff;
    try {
        await axios_1.default.post(process.env.DISCORD_WEBHOOK_URL, {
            username: 'Normies Alpha',
            embeds: [
                {
                    title: `⚡ ${alert.type.replace(/_/g, ' ')}`,
                    description: alert.message,
                    color,
                    footer: { text: `Severity: ${alert.severity}` },
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    }
    catch (err) {
        console.error('[notificationDispatcher] discord failed:', err);
    }
}
// ── Main dispatcher ───────────────────────────────────────────────────────────
async function dispatchAlert(alert) {
    await Promise.allSettled([
        dispatchInApp(alert),
        dispatchEmail(alert),
        dispatchTelegram(alert),
        dispatchDiscord(alert),
    ]);
}
