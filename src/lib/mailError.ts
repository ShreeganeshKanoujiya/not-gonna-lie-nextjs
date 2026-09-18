/**
 * Turns a nodemailer failure into one readable line.
 *
 * Nodemailer hangs the useful parts off the error object rather than the
 * message, so `String(error)` on its own usually reads "Error: Invalid login"
 * with no indication of which stage failed.
 */
export function describeMailError(error: unknown): string {
    if (!error || typeof error !== "object") {
        return String(error);
    }

    const mailError = error as {
        code?: string;
        command?: string;
        responseCode?: number;
        response?: string;
        message?: string;
    };

    const parts = [
        mailError.code,
        mailError.responseCode ? `SMTP ${mailError.responseCode}` : undefined,
        mailError.command ? `during ${mailError.command}` : undefined,
        mailError.response ?? mailError.message,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : String(error);
}

/** Common SMTP failures, with the thing to actually go change. */
export function mailErrorHint(error: unknown): string | undefined {
    const code = (error as { code?: string })?.code;
    const responseCode = (error as { responseCode?: number })?.responseCode;

    if (code === "EAUTH" || responseCode === 535) {
        return "SMTP rejected the credentials. For Gmail this means SMTP_USER must be the full address and SMTP_PASS must be a current App Password (2-Step Verification on, and the password not revoked).";
    }
    if (code === "ESOCKET" || code === "ECONNECTION" || code === "ETIMEDOUT" || code === "EDNS") {
        return "Could not reach the SMTP host. Check SMTP_HOST/SMTP_PORT and that outbound port 587 is not blocked by the network.";
    }
    if (responseCode === 553 || responseCode === 550) {
        return "The server refused the sender or recipient. MAIL_FROM usually has to match the authenticated SMTP_USER.";
    }
    return undefined;
}
