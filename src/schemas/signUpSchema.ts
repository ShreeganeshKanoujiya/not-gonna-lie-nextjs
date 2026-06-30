import {z} from "zod";

export const usernameValidation = z
.string()
.min(3, "Username must be at least 3 characters long")
.max(20, "Username must be at most 20 characters long")
.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const  signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"}).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
})