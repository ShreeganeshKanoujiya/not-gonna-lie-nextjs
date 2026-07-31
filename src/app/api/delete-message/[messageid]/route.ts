import mongoose from "mongoose";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageid: string }> },
) {
  const { messageid: messageId } = await params;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user as User;
  if (!session || !_user.id) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    if (!mongoose.isValidObjectId(messageId)) {
      return Response.json(
        { success: false, message: "Invalid message id" },
        { status: 400 },
      );
    }

    const messageObjectId = new mongoose.Types.ObjectId(messageId);
    const updateResult = await UserModel.updateOne(
      { _id: _user.id },
      { $pull: { message: { _id: messageObjectId } } },
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 },
      );
    }

    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 },
    );
  }
}
