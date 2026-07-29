import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user.id) {
        return Response.json({
            success: false,
            message: "Unauthorized access. Please log in.",
        }, { status: 401 });
    }

    const userId = user.id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true });

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user. User not found.",
                updatedUser: null
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "User updated successfully.",
            updatedUser,
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return Response.json({
            success: false,
            message: "Error updating user.",
            updatedUser: null
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user.id) {
        return Response.json({
            success: false,
            message: "Unauthorized access. Please log in.",
        }, { status: 401 });
    }

    const userId = user.id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found.",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "User found.",
            isAcceptingMessage: foundUser.isAcceptingMessage
        }, { status: 200 });
    } catch (error) {
        console.error("Error retrieving user:", error);
        return Response.json({
            success: false,
            message: "Error retrieving user.",
        }, { status: 500 });
    }
}