import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiFetch } from "./api";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns a successful API envelope", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { status: "ok" },
        msg: "Healthy",
      }),
    );

    const response = await apiFetch<{ status: string }>("/api/health");

    expect(response.data.status).toBe("ok");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:7000/api/health",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("refreshes an expired session and retries once", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          { success: false, message: "Unauthorized", data: null, msg: "" },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: null,
          msg: "Access token refreshed",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { username: "demo" },
          msg: "Current user fetched",
        }),
      );

    const response = await apiFetch<{ username: string }>("/api/auth/me");

    expect(response.data.username).toBe("demo");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("throws a typed error for a failed request", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          message: "Invalid input",
          data: null,
          msg: "",
        },
        400,
      ),
    );

    await expect(
      apiFetch("/api/auth/register", { skipRefresh: true }),
    ).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        name: "ApiClientError",
        message: "Invalid input",
        status: 400,
      }),
    );
  });
});
