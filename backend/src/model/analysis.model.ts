import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface IAnalysis extends Document {
  inputType: string;
  jobDescription: string;
  sourceUrl: string;
  riskScore: number;
  verdict: string;
  redFlags: string[];
  greenFlags: string[];
  userId: Types.ObjectId;
}
const analysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inputType: {
      type: String,
      enum: ["paste", "url"],
      required: true,
    },

    jobDescription: {
      type: String,
      default: null,
    },

    sourceUrl: {
      type: String,
      default: null,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    verdict: {
      type: String,
      enum: ["safe", "suspicious", "fake"],
      required: true,
    },

    redFlags: {
      type: [String],
      default: [],
    },

    greenFlags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const Analysis: Model<IAnalysis> = mongoose.model<IAnalysis>(
  "Analysis",
  analysisSchema,
);
