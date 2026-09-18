import { readFile } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import net from "node:net";
import path from "node:path";
import nodemailer from "nodemailer";
import type { ApiResponse } from "@/types/ApiResponse";

/** `detail` carries the underlying SMTP failure so callers can surface it. */
export type MailResult = ApiResponse & { detail?: string };

export function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] ?? character);
}

export function getMailerConfig() {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
        throw new Error(
            "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM."
        );
    }

    const port = Number(SMTP_PORT);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("SMTP_PORT must be a valid port number.");
    }

    return {
        host: SMTP_HOST,
        port,
        secure: SMTP_SECURE === "true",
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        from: MAIL_FROM,
        replyTo: process.env.MAIL_REPLY_TO || undefined,
    };
}

/**
 * Reads a template from /emails and substitutes {{placeholders}}.
 * Values are HTML-escaped, so a template must never place one inside an
 * attribute that expects a URL or inside a <script>.
 */
export async function renderEmailTemplate(
    fileName: string,
    values: Record<string, string>
): Promise<string> {
    const templatePath = path.join(process.cwd(), "emails", fileName);
    const template = await readFile(templatePath, "utf8");

    return Object.entries(values).reduce(
        (html, [key, value]) =>
            html.replace(new RegExp(`{{${key}}}`, "g"), escapeHtml(value)),
        template
    );
}

/**
 * Resolves the SMTP host ourselves, via getaddrinfo.
 *
 * nodemailer resolves hostnames with dns.resolve4/resolve6 (c-ares) and treats a
 * resolver *error* as fatal — the dns.lookup fallback inside its resolveHostname
 * only runs when those return empty without erroring. So on a machine where
 * c-ares points at a resolver that never answers (a VPN client or local DNS
 * proxy leaves dns.getServers() as ["127.0.0.1"]), every send dies with
 * "EDNS queryA ETIMEOUT" even though ordinary DNS is perfectly healthy.
 *
 * Handing nodemailer an IP skips its resolver entirely, because resolveHostname
 * short-circuits on net.isIP(). getaddrinfo is the same path the rest of the
 * system uses, so it works wherever the machine's DNS works.
 */
async function resolveSmtpHost(host: string): Promise<string> {
    if (net.isIP(host)) {
        return host;
    }
    try {
        const { address } = await lookup(host);
        return address;
    } catch {
        // Let nodemailer try the hostname so its error is the one reported.
        return host;
    }
}

export async function sendMail({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html: string;
    /**
     * Plain-text alternative. Not optional in practice: an HTML-only message is
     * multipart/alternative with one arm missing, which every mainstream filter
     * (SpamAssassin's MIME_HTML_ONLY among them) treats as a spam signal. Supply
     * real prose rather than a stripped-tag version of the HTML.
     */
    text: string;
}): Promise<void> {
    const config = getMailerConfig();
    const address = await resolveSmtpHost(config.host);

    const transporter = nodemailer.createTransport({
        host: address,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        // Connecting by IP, so SNI and certificate validation need to be told
        // the real hostname.
        tls: { servername: config.host },
    });

    await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
        html,
        replyTo: config.replyTo,
        headers: {
            // Marks these as machine-generated transactional mail so responders
            // and filters treat them accordingly, and so nothing auto-replies.
            "Auto-Submitted": "auto-generated",
            "X-Auto-Response-Suppress": "All",
        },
    });
}
