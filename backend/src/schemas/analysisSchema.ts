import { z } from "zod";

export const analysisSchema = z.object({
  input: z
    .string("Input field empty hai - job description ya URL dalo")
    .trim()
    .min(30, "Input bahut chhota hai - proper job description paste karo"),
});

export type AnalysisInput = z.infer<typeof analysisSchema>;
