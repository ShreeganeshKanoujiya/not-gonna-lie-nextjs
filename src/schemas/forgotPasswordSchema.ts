import { z } from "zod";
import { passwordValidation } from "@/schemas/signUpSchema";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const resetCodeSchema = z.object({
  code: z.string().length(6, "Reset code must be 6 digits"),
});

export const newPasswordSchema = z
  .object({
    // Shared with sign-up so the two rules can never drift apart.
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
