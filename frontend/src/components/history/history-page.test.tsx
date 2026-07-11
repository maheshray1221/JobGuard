import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./history-page";
import { ApiClientError, apiFetch } from "@/lib/api";

const router = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/api", () => {
  class ApiClientError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly errors: Array<{ field?: string; message?: string }> = [],
    ) {
      super(message);
      this.name = "ApiClientError";
    }
  }

  return {
    ApiClientError,
    apiFetch: vi.fn(),
  };
});

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiClientError("Unauthorized request", 401),
    );

    render(createElement(HistoryPage));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows the empty history state", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: [],
      msg: "History fetched",
    });

    render(createElement(HistoryPage));

    expect(await screen.findByText("No analyses yet")).toBeInTheDocument();
    expect(
      screen.getByText("Analyze your first job listing to start building a history."),
    ).toBeInTheDocument();
  });

  it("shows API errors", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiClientError("Could not load history", 500),
    );

    render(createElement(HistoryPage));

    expect(await screen.findByText("History unavailable")).toBeInTheDocument();
    expect(screen.getByText("Could not load history")).toBeInTheDocument();
  });

  it("renders records and filters by verdict", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: [
        {
          _id: "a1",
          input: "Suspicious remote job asking for a processing fee.",
          inputType: "paste",
          sourceUrl: null,
          riskScore: 95,
          verdict: "fake",
          redFlags: ["Payment requested"],
          greenFlags: [],
          createdAt: "2026-07-11T04:30:00.000Z",
        },
      ],
      msg: "History fetched",
    });

    render(createElement(HistoryPage));

    expect(
      await screen.findByText("Suspicious remote job asking for a processing fee."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Safe" }));

    expect(await screen.findByText("No matching analyses")).toBeInTheDocument();
  });
});
