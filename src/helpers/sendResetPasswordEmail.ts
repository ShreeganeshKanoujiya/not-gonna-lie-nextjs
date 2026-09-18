import { renderEmailTemplate, sendMail, type MailResult } from "@/lib/mailer";
import { describeMailError, mailErrorHint } from "@/lib/mailError";
import { RESET_CODE_TTL_MINUTES } from "@/lib/resetPasswordCode";

export async function sendResetPasswordEmail(
    email: string,
    username: string,
    resetCode: string
): Promise<MailResult> {
    try {
        const html = await renderEmailTemplate("reset_password_email.html", {
            to_name: username,
            otp_code: resetCode,
            expiry_minutes: String(RESET_CODE_TTL_MINUTES),
            current_year: String(new Date().getFullYear()),
        });

        await sendMail({
            to: email,
            subject: `Not Gonna Lie - Password Reset Code`,
            text: [
                `Hello ${username},`,
                "",
                "Someone asked to reset the password on your account. Your reset code is:",
                "",
                `    ${resetCode}`,
                "",
                `It expires in ${RESET_CODE_TTL_MINUTES} minutes.`,
                "",
                "Didn't request this? Ignore this email - your password stays exactly as it is.",
                "Never share this code. Nobody from Not Gonna Lie will ask you for it.",
                "",
                "- Not Gonna Lie",
            ].join("\n"),
            html,
        });

        return {
            success: true,
            message: "Password reset email sent successfully.",
            messages: [],
        }
    } catch (emailError) {
        const detail = describeMailError(emailError);
        const hint = mailErrorHint(emailError);

        console.error("[reset-password] failed to send email:", detail);
        if (hint) console.error("[reset-password] hint:", hint);

        return {
            success: false,
            message: "Failed to send password reset email.",
            messages: [],
            detail: hint ? `${detail} — ${hint}` : detail,
        }
    }
}
