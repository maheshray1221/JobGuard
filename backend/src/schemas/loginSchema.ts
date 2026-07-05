import { z } from "zod";

export const loginSchema = z
  .object({
    username: z.string().trim().min(3).max(50).toLowerCase().optional(),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase()
      .optional(),
    password: z
      .string()
      .min(5, "Password must be at least 5 characters")
      .max(72, "Password must be no more than 72 characters"),
  })
  .refine((data) => Boolean(data.username || data.email), {
    message: "Username or email is required",
    path: ["username"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
