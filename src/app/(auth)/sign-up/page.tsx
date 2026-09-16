"use client";

import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Sparkles, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { signUpValidation } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpValidation>>({
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const password = form.watch("password");
  const passwordRequirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (@ $ ! % * ? &)", met: /[@$!%*?&]/.test(password) },
  ];

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const isUsernameAvailable = usernameMessage === "Username is available.";

  const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);

      toast.success(response.data.message);

      router.replace(`/verify/${encodeURIComponent(data.username)}`);
    } catch (error) {
      console.error("Error during sign-up:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your sign-up. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-[calc(100svh-1px)] items-center justify-center overflow-hidden bg-sumi px-3 py-24 text-washi sm:px-6 sm:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_12%_18%,#e95776_0,transparent_24rem),radial-gradient(circle_at_85%_82%,#7063ff_0,transparent_28rem)]" />
      <div className="pointer-events-none absolute -right-20 top-28 size-20 rotate-12 rounded-[1.7rem] bg-coral/90" />
      {/* faint enso watermark, matches homepage motif */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 text-washi opacity-[0.04]"
      >
        <path
          d="M100 20c-46 5-80 40-75 88 5 46 47 78 92 72 41-5 68-36 72-72"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative w-full max-w-md rounded-[1.75rem] border border-washi/15 bg-washi p-4 text-sumi shadow-[0_28px_80px_rgba(0,0,0,0.32)] min-[380px]:p-5 sm:rounded-[2rem] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-sumi px-3 py-1.5 text-xs font-semibold tracking-wide text-lime">
            <LockKeyhole className="size-3.5" /> Secure sign up
          </div>
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-coral sm:hidden">
            <Sparkles className="size-3.5" /> Not Gonna Lie
          </div>
          <h1 className="font-display text-[2.15rem] leading-none tracking-[-0.055em] text-sumi sm:text-5xl">
            Make room for honesty.
          </h1>
          <p className="mt-3 text-sm leading-6 text-kobicha">
            Create your inbox and start hearing what people really think
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-7 space-y-6 sm:mt-8"
        >
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username" className="text-sumi">
                    Username
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="username"
                      autoComplete="username"
                      aria-invalid={fieldState.invalid}
                      placeholder="Choose a username"
                      className="h-13 rounded-xl border-sumi/15 bg-white px-4 pr-11 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25"
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 size-[1.1rem] -translate-y-1/2 animate-spin text-kobicha" />
                    )}
                    {!isCheckingUsername && usernameMessage && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {isUsernameAvailable ? (
                          <CheckCircle2 className="size-[1.1rem] text-aizome" />
                        ) : (
                          <XCircle className="size-[1.1rem] text-shu" />
                        )}
                      </span>
                    )}
                  </div>
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={
                        isUsernameAvailable
                          ? "text-sm text-aizome"
                          : "text-sm text-shu"
                      }
                    >
                      {usernameMessage}
                    </p>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="text-sumi">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="you@example.com"
                    className="h-13 rounded-xl border-sumi/15 bg-white px-4 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25"
                  />
                  <FieldDescription className="text-kobicha">
                    We&apos;ll send you a verification code
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className="text-sumi">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={password ? "password-requirements" : undefined}
                      placeholder="Create a password"
                      className="h-13 rounded-xl border-sumi/15 bg-white px-4 pr-12 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-kobicha transition-colors hover:bg-sumi/5 hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <ul
                      id="password-requirements"
                      aria-live="polite"
                      className="space-y-1 text-sm"
                    >
                      {passwordRequirements.map(({ label, met }) => (
                        <li
                          key={label}
                          className={`flex items-center gap-1.5 ${met ? "text-aizome" : "text-kobicha"}`}
                        >
                          {met ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                          )}
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            className="group h-13 w-full gap-2.5 rounded-full bg-sumi px-5 text-[0.95rem] text-washi shadow-[0_10px_24px_rgba(30,28,26,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_14px_30px_rgba(30,28,26,0.28)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 min-[380px]:px-6 sm:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Please wait
              </>
            ) : (
              <>
                Create your inbox
                <ArrowRight data-icon="inline-end" className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-kobicha">
          Already a member?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-aizome underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
