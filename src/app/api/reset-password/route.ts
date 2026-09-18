import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { clearResetCode, verifyResetCode } from "@/lib/resetPasswordCode";
import { passwordValidation } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, code, password } = await request.json();

        if (typeof email !== "string" || typeof code !== "string") {
            return Response.json({
                success: false,
                message: "Email and reset code are required.",
            }, { status: 400 });
        }

        // The client validates too, but this is the only check that counts.
        const parsedPassword = passwordValidation.safeParse(password);
        if (!parsedPassword.success) {
            return Response.json({
                success: false,
                message: parsedPassword.error.issues[0]?.message ?? "That password is not strong enough.",
            }, { status: 400 });
        }

        const user = await UserModel.findOne({ email: email.trim() });

        if (!user) {
            return Response.json({
                success: false,
                message: "No password reset is pending. Request a new code.",
            }, { status: 400 });
        }

        // Re-checked here because the earlier verify step does not consume the
        // code — this request is the one that must prove ownership.
        const verdict = await verifyResetCode(user, code);

        if (!verdict.ok) {
            return Response.json({
                success: false,
                message: verdict.message,
            }, { status: verdict.status });
        }

        user.password = await bcrypt.hash(parsedPassword.data, 10);
        clearResetCode(user);
        await user.save();

        return Response.json({
            success: true,
            message: "Password updated. You can sign in now.",
        }, { status: 200 });
    } catch (error) {
        console.error("Error resetting password:", error);
        return Response.json({
            success: false,
            message: "An error occurred while resetting your password.",
        }, { status: 500 });
    }
}
