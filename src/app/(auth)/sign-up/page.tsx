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
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
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
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-sumi px-4 py-16">
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

      <div className="relative w-full max-w-md rounded-2xl border border-washi/10 bg-card p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-shu/25 bg-shu/5 px-3 py-1 text-xs text-shu">
            本音 · honne
          </div>
          <h1 className="font-display text-3xl tracking-tight text-sumi sm:text-4xl">
            Join Not Gonna Lie
          </h1>
          <p className="mt-2 text-sm text-kobicha">
            Create your inbox and start hearing what people really think
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
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
                      className="border-sumi/15 bg-washi pr-9 text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-kobicha" />
                    )}
                    {!isCheckingUsername && usernameMessage && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {isUsernameAvailable ? (
                          <CheckCircle2 className="h-4 w-4 text-aizome" />
                        ) : (
                          <XCircle className="h-4 w-4 text-shu" />
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
                    className="border-sumi/15 bg-washi text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                  />
                  <FieldDescription className="text-kobicha">
                    We'll send you a verification code
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
                      className="border-sumi/15 bg-washi pr-10 text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-kobicha transition-colors hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome focus-visible:ring-offset-2"
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
            className="w-full rounded-full bg-sumi text-washi hover:bg-sumi/85"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Please wait
              </>
            ) : (
              "Create your inbox"
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
    </div>
  );
}
