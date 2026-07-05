import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("API security behavior", () => {
  it("reports API health without authentication", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: "ok" },
      msg: "JobGuard API is healthy",
    });
  });

  it("returns a JSON 401 for a protected endpoint", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Unauthorized request",
    });
  });

  it("rate-limits repeated login attempts", async () => {
    let response: request.Response | undefined;

    for (let attempt = 0; attempt < 11; attempt += 1) {
      response = await request(app).post("/api/auth/login").send({});
    }

    expect(response?.status).toBe(429);
    expect(response?.body).toMatchObject({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  });
});
