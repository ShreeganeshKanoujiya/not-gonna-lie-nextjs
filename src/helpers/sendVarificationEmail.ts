import { renderEmailTemplate, sendMail, type MailResult } from "@/lib/mailer";
import { describeMailError, mailErrorHint } from "@/lib/mailError";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<MailResult> {
    try {
        const html = await renderEmailTemplate("verification_email.html", {
            to_name: username,
            otp_code: verifyCode,
            expiry_minutes: "60",
            current_year: String(new Date().getFullYear()),
        });

        await sendMail({
            to: email,
            // Code-first subject is the shape every major transactional sender
            // uses, and it shows the code in a notification without opening.
            subject: `Not Gonna Lie - Verification Code`,
            text: [
                `Hello ${username},`,
                "",
                "Your Not Gonna Lie verification code is:",
                "",
                `    ${verifyCode}`,
                "",
                "It expires in 60 minutes.",
                "",
                "Didn't request this? Ignore this email - no account is created without the code.",
                "",
                "- Not Gonna Lie",
            ].join("\n"),
            html,
        });

        return {
            success: true,
            message: "Verification email sent successfully.",
            messages: [],
        }
    } catch (emailError) {
        const detail = describeMailError(emailError);
        const hint = mailErrorHint(emailError);

        console.error("[verify-email] failed to send email:", detail);
        if (hint) console.error("[verify-email] hint:", hint);

        return {
            success: false,
            message: "Failed to send verification email.",
            messages: [],
            detail: hint ? `${detail} — ${hint}` : detail,
        }
    }
}
