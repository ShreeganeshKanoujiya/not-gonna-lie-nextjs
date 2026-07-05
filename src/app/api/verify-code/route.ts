import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found.",
            }, { status: 404 });
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "Verification successful.",
            }, { status: 200 });
        } else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code has expired, please request a new one.",
            }, { status: 400 });
        } else {
            return Response.json({
                success: false,
                message: "Invalid verification code.",
            }, { status: 400 });
        }

    } catch(error) {
        console.error("Error verifying code:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while verifying the code.",
            },
            { status: 500 }
        )
    }
}