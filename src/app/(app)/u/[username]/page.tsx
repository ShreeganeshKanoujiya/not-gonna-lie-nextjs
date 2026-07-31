"use client";

import { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<z.input<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message, { shouldValidate: true });
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.input<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ content: "" });
      textareaRef.current?.focus();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to send message",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = !isLoading && !!messageContent?.trim();

  return (
    <div className="mx-auto my-10 max-w-2xl px-4 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-shu/25 bg-shu/5 px-3 py-1 text-xs text-shu">
          本音 · honne
        </div>
        <h1 className="font-display text-3xl font-medium text-sumi sm:text-4xl">
          Send @{username} an honest message
        </h1>
        <p className="mt-2 text-kobicha">
          No account needed. They won&apos;t know it was you.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="content" className="sr-only">
                  Message to @{username}
                </FieldLabel>

                <div className="relative">
                  <Textarea
                    {...field}
                    ref={(el) => {
                      field.ref(el);
                      textareaRef.current = el;
                    }}
                    id="content"
                    placeholder="Write what you'd never say with your name attached..."
                    aria-invalid={fieldState.invalid}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" || e.shiftKey) return;
                      // Only hijack Enter when we're actually going to submit —
                      // otherwise let it insert a normal newline.
                      if (!canSend) return;
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }}
                    className="min-h-32 resize-none rounded-2xl border-sumi/15 bg-card py-3 pl-4 pr-14 text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                  />

                  <Button
                    type="submit"
                    disabled={!canSend}
                    size="icon"
                    aria-label="Send message"
                    className="absolute bottom-2.5 right-2.5 h-9 w-9 rounded-full bg-shu p-0 text-washi shadow-sm transition-transform hover:bg-shu/90 disabled:bg-sumi/15 disabled:text-kobicha disabled:shadow-none enabled:active:scale-95"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-kobicha">
                    Enter to send · Shift + Enter for a new line
                  </span>
                </div>
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <div className="mt-10 space-y-3">
        <p className="text-center text-sm text-kobicha">
          Stuck? Tap a prompt to start.
        </p>
        <Card className="border-sumi/10 bg-card shadow-none">
          <CardHeader>
            <h3 className="font-display text-lg text-sumi">
              Conversation starters
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {parseStringMessages(initialMessageString).map((message) => (
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start whitespace-normal border-sumi/10 bg-washi py-2.5 text-left text-sumi hover:bg-sumi/5"
                key={message}
                onClick={() => handleMessageClick(message)}
              >
                {message}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 bg-sumi/10" />

      <div className="text-center">
        <p className="mb-3 text-sm text-kobicha">
          Want your own inbox like this?
        </p>
        <Button
          render={<Link href="/sign-up" />}
          nativeButton={false}
          className="rounded-full bg-sumi text-washi hover:bg-sumi/85"
        >
          Create your account
        </Button>
      </div>
    </div>
  );
}
