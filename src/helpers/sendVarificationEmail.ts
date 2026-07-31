import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import React from "react";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Not Gonna Lie <onboarding@resend.dev>';
        const { error } = await resend.emails.send({
            from: fromAddress,
            to: email,
            subject: 'Not Gonna Lie - Verify Your Email',
            react: React.createElement(VerificationEmail, { username, otp: verifyCode }),
        });

        if (error) {
            throw error;
        }

        return {
            success: true,
            message: "Verification email sent successfully.",
            messages: [],
        }
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {
            success: false,
            message: "Failed to send verification email.",
            messages: [],
        }
    }
}