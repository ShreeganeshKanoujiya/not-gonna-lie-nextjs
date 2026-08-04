import { ApiResponse } from "@/types/ApiResponse";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

const verificationTemplatePath = path.join(
    process.cwd(),
    "emails",
    "verification_email.html"
);

function escapeHtml(value: string): string {
    return value.replace(/[&<>'\"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] ?? character);
}

function getMailerConfig() {
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
    };
}

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const config = getMailerConfig();
        const template = await readFile(verificationTemplatePath, "utf8");
        const html = template
            .replace(/{{to_name}}/g, escapeHtml(username))
            .replace(/{{otp_code}}/g, escapeHtml(verifyCode))
            .replace(/{{expiry_minutes}}/g, "60")
            .replace(/{{current_year}}/g, String(new Date().getFullYear()));

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
        });

        await transporter.sendMail({
            from: config.from,
            to: email,
            subject: 'Not Gonna Lie - Verify Your Email',
            html,
        });

        return {
            success: true,
            message: "Verification email sent successfully.",
            messages: [],
        }
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {
            success: false,
            message: "Failed to send verification email.",
            messages: [],
        }
    }
}
