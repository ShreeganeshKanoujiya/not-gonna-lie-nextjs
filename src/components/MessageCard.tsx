"use client";

import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Message } from "@/model/User";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogEyebrow,
  AlertDialogHeader,
  AlertDialogMedia,
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
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
      // Only reset on failure — a success unmounts this card.
      setIsDeleting(false);
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
                <AlertDialogMedia>
                  <Trash2 />
                </AlertDialogMedia>
                <div className="space-y-2">
                  <AlertDialogEyebrow>Can&apos;t be undone</AlertDialogEyebrow>
                  <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  It leaves your inbox for good. We keep no copy, and the sender
                  is never told.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {/* The backdrop hides the card, so restate which message this is. */}
              <blockquote className="line-clamp-3 rounded-2xl border border-sumi/10 bg-washi px-4 py-3.5 font-display text-lg leading-snug tracking-[-0.03em] text-sumi">
                “{message.content}”
              </blockquote>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-washi hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Delete message
                    </>
                  )}
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
