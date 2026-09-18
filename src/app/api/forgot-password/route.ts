import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { createResetCode } from "@/lib/resetPasswordCode";
import { sendResetPasswordEmail } from "@/helpers/sendResetPasswordEmail";
import { forgotPasswordSchema } from "@/schemas/forgotPasswordSchema";

/**
 * Starts a password reset.
 *
 * The response is deliberately identical whether or not the address belongs to
 * an account, so this endpoint cannot be used to discover who has registered.
 */
export async function POST(request: Request) {
    await dbConnect();

    const genericSuccess = Response.json({
        success: true,
        message: "If that email has an account, a reset code is on its way.",
    }, { status: 200 });

    try {
        const body = await request.json();
        const parsed = forgotPasswordSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json({
                success: false,
                message: "Please provide a valid email address.",
            }, { status: 400 });
        }

        const email = parsed.data.email.trim();
        const user = await UserModel.findOne({ email });

        // Unverified accounts cannot sign in, so there is nothing to reset.
        if (!user || !user.isVerified) {
            return genericSuccess;
        }

        const { code, expiresAt } = createResetCode();
        user.resetPasswordCode = code;
        user.resetPasswordCodeExpires = expiresAt;
        user.resetPasswordAttempts = 0;
        await user.save();

        const emailResult = await sendResetPasswordEmail(user.email, user.username, code);

        if (!emailResult.success) {
            // Don't strand a live code we could not deliver.
            user.resetPasswordCode = undefined;
            user.resetPasswordCodeExpires = undefined;
            user.resetPasswordAttempts = undefined;
            await user.save();

            // The generic message is a dead end when SMTP is misconfigured, so
            // outside production hand back what the mail server actually said.
            const isProduction = process.env.NODE_ENV === "production";
            return Response.json({
                success: false,
                message: isProduction || !emailResult.detail
                    ? "We could not send the reset email. Please try again."
                    : `Could not send the reset email. ${emailResult.detail}`,
            }, { status: 500 });
        }

        return genericSuccess;
    } catch (error) {
        console.error("Error starting password reset:", error);
        return Response.json({
            success: false,
            message: "An error occurred while starting the password reset.",
        }, { status: 500 });
    }
}
