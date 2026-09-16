"use client";

import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import { Message } from "@/model/User";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const handleDeleteConfirm = async () => {
  try {
    const response = await axios.delete<ApiResponse>(
      `/api/delete-message/${message._id}`,
    );
    toast.success(response.data.message || "Message deleted successfully");
    onMessageDelete(String(message._id));
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast.error(
      axiosError.response?.data.message ?? "Failed to delete message",
    );
  }
};

  return (
    <Card className="rounded-[1.5rem] border border-sumi/10 bg-card py-0 shadow-[0_8px_24px_rgba(30,28,26,0.05)] transition-transform duration-200 hover:-translate-y-1">
      <CardHeader className="gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-display text-2xl leading-[1.05] tracking-[-0.035em] text-sumi">“{message.content}”</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="ghost" size="icon" className="size-9 shrink-0 rounded-full text-kobicha hover:bg-coral/10 hover:text-coral" />}
            >
              <Trash2 className="size-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can&apos;t be undone. The message will be permanently removed
                  from your inbox.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-kobicha"><span className="size-1.5 rounded-full bg-coral" /> Anonymous · {dayjs(message.createdAt).format("MMM D, YYYY · h:mm A")}</div>
      </CardHeader>
    </Card>
  );
}
