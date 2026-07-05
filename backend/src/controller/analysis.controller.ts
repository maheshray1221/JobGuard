import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { fetchAndParseURL } from "../utils/urlParser.js";
import { detectInputType } from "../utils/detectInputType.js";
import { analyzeWithGroq } from "../utils/analysisWithGroq.js";
import type { AnalysisInput } from "../schemas/analysisSchema.js";
import { Analysis } from "../model/analysis.model.js";
import mongoose from "mongoose";

export const analyzeJob = asyncHandler(
  async (req: Request<{}, {}, AnalysisInput>, res: Response): Promise<void> => {
    const { input } = req.body;

    const inputType = detectInputType(input);

    let textToAnalyze: string;
    let sourceUrl: string | null = null;

    if (inputType === "url") {
      sourceUrl = input.trim().startsWith("www.")
        ? `https://${input.trim()}`
        : input.trim();

      textToAnalyze = await fetchAndParseURL(sourceUrl);
    } else {
      textToAnalyze = input.trim();
    }

    if (textToAnalyze.length < 50) {
      throw new ApiError(
        400,
        "Job description bahut chhoti hai — proper JD paste karo",
      );
    }

    // ── Groq call ───────────────────────────────────────────────
    const result = await analyzeWithGroq(textToAnalyze); // ← ADD

    await Analysis.create({
      userId: req.user._id,
      input,
      inputType,
      jobDescription: textToAnalyze,
      sourceUrl: sourceUrl ?? undefined,
      riskScore: result.risk_score,
      verdict: result.verdict,
      redFlags: result.red_flags,
      greenFlags: result.green_flags,
    });
    // ── Response ────────────────────────────────────────────────
    res.status(200).json(
      new ApiResponse(
        200,
        {
          input,
          sourceUrl,
          riskScore: result.risk_score,
          verdict: result.verdict,
          redFlags: result.red_flags,
          greenFlags: result.green_flags,
        },
        "Job analysis complete",
      ),
    );
  },
);

export const getHistory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select("-jobDescription")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(new ApiResponse(200, analyses, "Analysis history fetched"));
  },
);

export const getSingleAnalysis = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid analysis ID");
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!analysis) {
      throw new ApiError(404, "Analysis not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, analysis, "Analysis fetched"));
  },
);
