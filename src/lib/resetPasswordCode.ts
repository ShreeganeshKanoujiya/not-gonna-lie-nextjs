import { randomInt } from "node:crypto";
import type { User } from "@/model/User";

/** Shorter than the signup code — a reset is a higher-value target. */
export const RESET_CODE_TTL_MINUTES = 15;

/** A 6-digit code is only 10^6 wide, so the attempt cap is the real defence. */
export const RESET_CODE_MAX_ATTEMPTS = 5;

export function createResetCode(): { code: string; expiresAt: Date } {
    // randomInt, not Math.random: a predictable reset code is an account
    // takeover, not just a guessable signup code.
    const code = String(randomInt(100_000, 1_000_000));
    return {
        code,
        expiresAt: new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000),
    };
}

export function clearResetCode(user: User): void {
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    user.resetPasswordAttempts = undefined;
}

type ResetCodeVerdict =
    | { ok: true }
    | { ok: false; message: string; status: number };

/**
 * Checks a submitted reset code and records the attempt.
 *
 * A correct code is deliberately *not* cleared here — the reset route clears it
 * only once the new password is actually saved, so the code stays valid across
 * the "enter code" and "choose password" steps of the form.
 */
export async function verifyResetCode(
    user: User,
    code: string
): Promise<ResetCodeVerdict> {
    if (!user.resetPasswordCode || !user.resetPasswordCodeExpires) {
        return {
            ok: false,
            status: 400,
            message: "No password reset is pending. Request a new code.",
        };
    }

    if (new Date(user.resetPasswordCodeExpires) <= new Date()) {
        clearResetCode(user);
        await user.save();
        return {
            ok: false,
            status: 400,
            message: "That code has expired. Request a new one.",
        };
    }

    if ((user.resetPasswordAttempts ?? 0) >= RESET_CODE_MAX_ATTEMPTS) {
        clearResetCode(user);
        await user.save();
        return {
            ok: false,
            status: 429,
            message: "Too many incorrect attempts. Request a new code.",
        };
    }

    if (user.resetPasswordCode !== code) {
        const attempts = (user.resetPasswordAttempts ?? 0) + 1;
        const isLocked = attempts >= RESET_CODE_MAX_ATTEMPTS;

        if (isLocked) {
            clearResetCode(user);
        } else {
            user.resetPasswordAttempts = attempts;
        }
        await user.save();

        return {
            ok: false,
            status: isLocked ? 429 : 400,
            message: isLocked
                ? "Too many incorrect attempts. Request a new code."
                : "That code is not right. Check your email and try again.",
        };
    }

    return { ok: true };
}
