import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
}));

vi.mock("./model/user.model.js", () => ({
  default: {
    findById: mocks.findById,
  },
}));

import { app } from "./app.js";

describe("POST /api/auth/refresh-token", () => {
  beforeEach(() => {
    mocks.findById.mockReset();
  });

  it("rejects a request without a refresh-token cookie", async () => {
    const response = await request(app).post("/api/auth/refresh-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Refresh token is required");
  });

  it("rejects an invalid refresh token", async () => {
    const response = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", "refreshToken=invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired refresh token");
  });

  it("rotates a valid stored refresh token", async () => {
    const userId = new Types.ObjectId();
    const incomingToken = jwt.sign(
      { _id: userId.toString() },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "5m" },
    );
    const user = {
      _id: userId,
      refreshToken: incomingToken,
      generateAccessToken: vi.fn(() => "new-access-token"),
      generateRefreshToken: vi.fn(() => "new-refresh-token"),
      save: vi.fn().mockResolvedValue(undefined),
    };
    mocks.findById.mockResolvedValue(user);

    const response = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", `refreshToken=${incomingToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: null,
      msg: "Access token refreshed",
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken=new-access-token"),
        expect.stringContaining("refreshToken=new-refresh-token"),
      ]),
    );
    expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
  });
});
