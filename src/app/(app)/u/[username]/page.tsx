"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dice5,
  Loader2,
  Lock,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  "What's your favorite movie?||Do you have any pets?||What's your dream job?||Tell me something you've never said.||What's your honest opinion of me?||Describe me in three words.||What song reminds you of me?||Drop an anonymous confession.||What should I hear more often?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const promptsContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const form = useForm<z.input<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content");

  const updateScrollButtons = useCallback(() => {
    const el = promptsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollPrompts = (direction: "left" | "right") => {
    const el = promptsContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleRandomPrompt = () => {
    const prompts = parseStringMessages(initialMessageString);
    if (!prompts.length) return;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    form.setValue("content", randomPrompt, { shouldValidate: true });
    textareaRef.current?.focus();
  };

  const handleMessageClick = (message: string) => {
    // Avoid triggering prompt click when user was dragging to scroll on desktop
    if (dragDistanceRef.current > 6) return;
    form.setValue("content", message, { shouldValidate: true });
    textareaRef.current?.focus();
  };

  // Drag-to-scroll handlers for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = promptsContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = promptsContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    dragDistanceRef.current = Math.abs(walk);
    el.scrollLeft = scrollLeftRef.current - walk;
    updateScrollButtons();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const el = promptsContainerRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });

    // Handle horizontal mouse wheel scrolling on desktop
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (e.deltaY !== 0) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        const atStart = el.scrollLeft <= 0;
        const atEnd = el.scrollLeft >= maxScroll;

        if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          updateScrollButtons();
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      el.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (data: z.input<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ content: "" });
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
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
    <main className="relative flex min-h-svh flex-col items-center bg-sumi">
      {/* ── Gradient background ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_20%,#e95776_0,transparent_22rem),radial-gradient(circle_at_85%_80%,#c8f24a_0,transparent_20rem),radial-gradient(circle_at_55%_10%,#7063ff_0,transparent_26rem)]" />

      {/* ── Decorative shapes ──────────────────────────────────────── */}
      <div className="pointer-events-none absolute -left-10 top-32 hidden size-52 rounded-full border border-washi/15 md:block" />
      <div className="pointer-events-none absolute right-[10%] top-20 hidden size-16 rotate-12 rounded-[1.4rem] bg-coral/60 md:block" />

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-lg flex-1 flex-col items-center px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        {/* ── Floating badge ─────────────────────────────────────── */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-washi/20 bg-washi/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-washi/80 backdrop-blur-sm">
          <Sparkles className="size-3.5 text-lime" />
          匿名 · anonymous
        </div>

        {/* ── Message card ───────────────────────────────────────── */}
        <div className="w-full overflow-hidden rounded-[2rem] shadow-2xl">
          {/* Card header – profile area */}
          <div className="flex items-center gap-3.5 bg-washi px-5 pb-4 pt-5 sm:px-6">
            {/* Avatar placeholder */}
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-sumi/10 text-sm font-bold text-sumi sm:size-12">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sumi sm:text-base">
                @{username}
              </p>
              <p className="text-xs font-medium text-shu sm:text-sm">
                send me an anonymous message!
              </p>
            </div>
          </div>

          {/* Textarea zone – frosted glass */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="content" className="sr-only">
                      Message to @{username}
                    </FieldLabel>

                    <div className="relative bg-washi/60 backdrop-blur-xl">
                      <Textarea
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          textareaRef.current = el;
                        }}
                        id="content"
                        placeholder="Write what you'd never say with your name attached..."
                        aria-invalid={fieldState.invalid}
                        maxLength={300}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" || e.shiftKey) return;
                          if (!canSend) return;
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }}
                        className="min-h-36 resize-none border-none bg-transparent px-5 py-4 text-base font-semibold text-sumi placeholder:text-sumi/25 focus-visible:border-none focus-visible:ring-0 sm:min-h-40 sm:px-6 sm:text-lg"
                      />
                    </div>

                    {fieldState.invalid && (
                      <div className="bg-washi/60 px-5 pb-2 sm:px-6">
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Send button – full-width pill */}
            <div className="bg-washi/60 px-5 pb-5 pt-2 backdrop-blur-xl sm:px-6 sm:pb-6">
              <Button
                type="submit"
                disabled={!canSend}
                className="h-14 w-full gap-2.5 rounded-full bg-sumi text-base font-bold text-washi shadow-[0_8px_24px_rgba(30,28,26,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_12px_30px_rgba(30,28,26,0.4)] active:translate-y-0 active:scale-[0.98] disabled:bg-sumi/40 disabled:shadow-none sm:text-lg"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : isSent ? (
                  "Sent! ✓"
                ) : (
                  <>
                    Send!
                    <SendHorizonal className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Lock tooltip ───────────────────────────────────────── */}
        <div className="mt-4 flex items-center gap-2 text-sm text-washi/60">
          <Lock className="size-3.5" />
          <span>anonymous · your identity stays hidden</span>
        </div>

        {/* ── Conversation starters ──────────────────────────────── */}
        <div className="mt-10 w-full">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-washi/60">
              <Dice5 className="size-4 text-lime" />
              <span className="hidden min-[400px]:inline">Stuck? Tap a prompt to start</span>
              <span className="min-[400px]:hidden">Tap a prompt to start</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRandomPrompt}
                title="Roll random prompt"
                className="inline-flex items-center gap-1.5 rounded-full border border-washi/15 bg-washi/10 px-2.5 py-1 text-xs font-medium text-washi/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-washi/30 hover:bg-washi/20 hover:text-washi active:scale-95"
              >
                <Dice5 className="size-3.5 text-lime" />
                <span>Shuffle</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollPrompts("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left"
                  className="grid size-7 place-items-center rounded-full border border-washi/15 bg-washi/10 text-washi/70 backdrop-blur-sm transition-all duration-200 hover:border-washi/30 hover:bg-washi/20 hover:text-washi disabled:opacity-25 disabled:hover:border-washi/15 disabled:hover:bg-washi/10 disabled:hover:text-washi/70 active:scale-95"
                >
                  <ChevronLeft className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollPrompts("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll right"
                  className="grid size-7 place-items-center rounded-full border border-washi/15 bg-washi/10 text-washi/70 backdrop-blur-sm transition-all duration-200 hover:border-washi/30 hover:bg-washi/20 hover:text-washi disabled:opacity-25 disabled:hover:border-washi/15 disabled:hover:bg-washi/10 disabled:hover:text-washi/70 active:scale-95"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              ref={promptsContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="-mx-4 flex cursor-grab snap-x gap-2.5 overflow-x-auto px-4 pb-3 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
            >
              {parseStringMessages(initialMessageString).map((message) => (
                <button
                  type="button"
                  key={message}
                  onClick={() => handleMessageClick(message)}
                  className="shrink-0 snap-start rounded-full border border-washi/15 bg-washi/8 px-4 py-2.5 text-sm text-washi/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-washi/30 hover:bg-washi/15 hover:text-washi active:scale-[0.97]"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Spacer to push CTA toward bottom ───────────────────── */}
        <div className="flex-1" />

        {/* ── Bottom CTA section ──────────────────────────────────── */}
        <div className="mt-12 w-full text-center">
          <p className="mb-4 text-sm font-bold text-washi/50">
            👇 Join the conversation 👇
          </p>

          <Button
            render={<Link href="/sign-up" />}
            nativeButton={false}
            className="group h-14 w-full gap-2.5 rounded-full bg-lime px-7 text-[0.95rem] font-bold leading-none text-sumi shadow-[0_10px_24px_rgba(200,242,74,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[0_14px_30px_rgba(200,242,74,0.28)] active:translate-y-0 active:scale-[0.98] [&_svg]:block sm:text-base"
          >
            Get your own inbox!
            <ArrowRight
              data-icon="inline-end"
              className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1"
            />
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-washi/35">
            <Link
              href="/"
              className="transition-colors hover:text-washi/60"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-washi/60"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
