import { z } from "zod";

const analysisSchema = z
  .object({
    inputType: z.enum(["paste", "url"], { message: "input type required" }),

    jobDescription: z
      .string()
      .min(50, "Job description must be atleast 50 characters")
      .max(5000, "Job description must be no more then 5000")
      .optional()
      .nullable(),

    sourceUrl: z
      .string()
      .url("fill valid Url - https://example.com")
      .optional()
      .nullable(),

    riskScore: z
      .number("risk score should be a number")
      .min(0, "riskScore must be start 0")
      .max(100, "riskScore must be no more then 100"),

    verdict: z.enum(["safe", "suspicious", "fake"], {
      message: "verdict required",
    }),

    redFlags: z
      .array(z.string().min(1, "Red flag empty nahi ho sakta"))
      .default([]),

    greenFlags: z
      .array(z.string().min(1, "Green flag empty nahi ho sakta"))
      .default([]),
  })

  .refine((data) => {
    if (data.inputType === "paste") return !!data.jobDescription;
    if (data.inputType === "url") return !!data.sourceUrl;
    return false;
  });
export type AnalysisInput = z.infer<typeof analysisSchema>;
