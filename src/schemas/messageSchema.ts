import {z} from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(3, {message: "Message must be at least 3 characters long"})
        .max(1000, {message: "Message must be at most 1000 characters long"}),
    createdAt: z
        .date()
        .default(() => new Date())
});