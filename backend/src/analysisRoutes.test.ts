import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindById: vi.fn(),
  analysisCreate: vi.fn(),
  analysisFind: vi.fn(),
  analysisFindOne: vi.fn(),
  analyzeWithGroq: vi.fn(),
}));

vi.mock("./model/user.model.js", () => ({
  default: {
    findById: mocks.userFindById,
  },
}));

vi.mock("./model/analysis.model.js", () => ({
  Analysis: {
    create: mocks.analysisCreate,
    find: mocks.analysisFind,
    findOne: mocks.analysisFindOne,
  },
}));

vi.mock("./utils/analysisWithGroq.js", () => ({
  analyzeWithGroq: mocks.analyzeWithGroq,
}));

import { app } from "./app.js";

describe("authenticated analysis routes", () => {
  const userId = new Types.ObjectId();
  const accessToken = jwt.sign(
    {
      _id: userId.toString(),
      username: "jobseeker",
      email: "user@example.com",
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "5m" },
  );
  const authorization = { Authorization: `Bearer ${accessToken}` };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: userId,
        username: "jobseeker",
        email: "user@example.com",
      }),
    });
  });

  it("analyzes pasted text and saves an owned result", async () => {
    mocks.analyzeWithGroq.mockResolvedValue({
      risk_score: 72,
      verdict: "fake",
      red_flags: ["Requests an upfront payment"],
      green_flags: [],
    });
    mocks.analysisCreate.mockResolvedValue({ _id: new Types.ObjectId() });

    const input =
      "Urgent remote job offer. Pay a registration fee before interview.";
    const response = await request(app)
      .post("/api/analysis/analyze")
      .set(authorization)
      .send({ input });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      input,
      sourceUrl: null,
      riskScore: 72,
      verdict: "fake",
      redFlags: ["Requests an upfront payment"],
      greenFlags: [],
    });
    expect(mocks.analysisCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        input,
        inputType: "paste",
        riskScore: 72,
      }),
    );
  });

  it("lists only analyses owned by the authenticated user", async () => {
    const records = [
      {
        _id: new Types.ObjectId(),
        userId,
        riskScore: 20,
        verdict: "safe",
      },
    ];
    const sort = vi.fn().mockResolvedValue(records);
    const select = vi.fn().mockReturnValue({ sort });
    mocks.analysisFind.mockReturnValue({ select });

    const response = await request(app)
      .get("/api/analysis/history")
      .set(authorization);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mocks.analysisFind).toHaveBeenCalledWith({ userId });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("rejects an invalid history ID", async () => {
    const response = await request(app)
      .get("/api/analysis/history/not-an-object-id")
      .set(authorization);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid analysis ID");
    expect(mocks.analysisFindOne).not.toHaveBeenCalled();
  });

  it("does not expose a missing or another user's analysis", async () => {
    const analysisId = new Types.ObjectId();
    mocks.analysisFindOne.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/analysis/history/${analysisId.toString()}`)
      .set(authorization);

    expect(response.status).toBe(404);
    expect(mocks.analysisFindOne).toHaveBeenCalledWith({
      _id: analysisId.toString(),
      userId,
    });
  });
});
