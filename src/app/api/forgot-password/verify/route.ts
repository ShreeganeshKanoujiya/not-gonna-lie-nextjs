import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifyResetCode } from "@/lib/resetPasswordCode";

/**
 * Checks a reset code without consuming it, so the form can tell the user the
 * code is wrong before asking them to type a new password. The code is checked
 * again when the password is actually saved.
 */
export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, code } = await request.json();

        if (typeof email !== "string" || typeof code !== "string") {
            return Response.json({
                success: false,
                message: "Email and reset code are required.",
            }, { status: 400 });
        }

        const user = await UserModel.findOne({ email: email.trim() });

        if (!user) {
            // Same wording as an expired code: never confirm the address exists.
            return Response.json({
                success: false,
                message: "No password reset is pending. Request a new code.",
            }, { status: 400 });
        }

        const verdict = await verifyResetCode(user, code);

        if (!verdict.ok) {
            return Response.json({
                success: false,
                message: verdict.message,
            }, { status: verdict.status });
        }

        return Response.json({
            success: true,
            message: "Code accepted. Choose a new password.",
        }, { status: 200 });
    } catch (error) {
        console.error("Error verifying reset code:", error);
        return Response.json({
            success: false,
            message: "An error occurred while checking the code.",
        }, { status: 500 });
    }
}
