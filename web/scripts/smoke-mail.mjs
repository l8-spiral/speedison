#!/usr/bin/env node
// Verify that the SMTP credentials in web/.env actually authenticate and
// can send a real message. Run once after setting up SMTP_*:
//
//   cd web && node scripts/smoke-mail.mjs

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");

function loadEnv() {
  const envFile = resolve(webRoot, ".env");
  if (!existsSync(envFile)) return;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv();

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT);
const secure = process.env.SMTP_SECURE === "true" || port === 465;

console.log(`Connecting to ${process.env.SMTP_HOST}:${port} (secure=${secure})...`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log("✓ SMTP credentials verified — authentication succeeded.\n");
} catch (e) {
  console.error("✗ SMTP verify failed:", e.message);
  process.exit(1);
}

const from = process.env.MAIL_FROM ?? '"Speedison" <info@speedison.se>';
const to = process.env.MAIL_TO ?? "info@speedison.se";

console.log(`Sending test message: ${from} → ${to}`);

const ts = new Date().toISOString();

try {
  const info = await transporter.sendMail({
    from,
    to,
    replyTo: "devops@goppis.se",
    subject: "[SMTP smoke test] Speedison local",
    text: `This is a local smoke test from web/scripts/smoke-mail.mjs.

If you see this in the info@speedison.se inbox, the SMTP credentials in
web/.env work and the same values will work in Railway env vars on prod.

Timestamp: ${ts}
Host:      ${process.env.SMTP_HOST}:${port} (secure=${secure})
User:      ${process.env.SMTP_USER}
`,
  });
  console.log(`✓ Message sent: ${info.messageId}`);
  console.log(`  Check the info@speedison.se inbox.`);
} catch (e) {
  console.error("✗ Send failed:", e.message);
  process.exit(1);
}
