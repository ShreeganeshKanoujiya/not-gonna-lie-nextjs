import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !user?.id) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: { message: [] } },
      { new: false },
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    const deletedCount = updatedUser.message.length;
    return Response.json({
      success: true,
      message: `${deletedCount} message${deletedCount === 1 ? "" : "s"} deleted.`,
    });
  } catch (error) {
    console.error("Error deleting all messages:", error);
    return Response.json(
      { success: false, message: "Error deleting messages." },
      { status: 500 },
    );
  }
}
