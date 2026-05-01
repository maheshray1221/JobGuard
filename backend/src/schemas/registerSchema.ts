import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(20, "Username must be no more then 20 characters"),

  email: z
    .string()
    .min(5, "Email must be atleast 5 characters")
    .max(20, "Email must be no more then 20 characters")
    .email("Invaild email address"),

  password: z
    .string()
    .min(5, "Password must be atleast 5 characters")
    .max(20, "Password must be no more then 20 characters"),
});
