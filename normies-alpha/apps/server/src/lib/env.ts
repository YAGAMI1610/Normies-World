// apps/server/src/lib/env.ts
import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: required("REDIS_URL", "redis://localhost:6379"),

  NORMIES_API_URL: required("NORMIES_API_URL", "https://api.normies.art"),

  RPC_URL: process.env.RPC_URL ?? "",
  NORMIES_CONTRACT_ADDRESS:
    process.env.NORMIES_CONTRACT_ADDRESS ??
    "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438",
  NORMIES_CANVAS_ADDRESS:
    process.env.NORMIES_CANVAS_ADDRESS ??
    "0x64951d92e345C50381267380e2975f66810E869c",
  NORMIES_DEPLOY_BLOCK: BigInt(process.env.NORMIES_DEPLOY_BLOCK ?? "18000000"),

  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  RESERVOIR_API_KEY: process.env.RESERVOIR_API_KEY ?? "",
  RESERVOIR_COLLECTION_ADDRESS:
    process.env.RESERVOIR_COLLECTION_ADDRESS ??
    "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438",

  JWT_SECRET: required("JWT_SECRET", "devsecret"),

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587", 10),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? "",

  WEB_ORIGIN: process.env.WEB_ORIGIN ?? "http://localhost:3000",
};
