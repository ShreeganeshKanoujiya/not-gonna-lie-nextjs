import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

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

    try {
        const foundUser = await UserModel.findById(user.id).select('message');

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found.",
            }, { status: 404 });
        }

        const messages = [...foundUser.message].sort(
            (firstMessage, secondMessage) =>
                new Date(secondMessage.createdAt).getTime() -
                new Date(firstMessage.createdAt).getTime()
        );

        return Response.json({
            success: true,
            message: "Messages retrieved successfully.",
            messages,
        }, { status: 200});

    } catch (error) {
        console.error("Error retrieving messages:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving messages.",
        }, { status: 500 });
    }
}