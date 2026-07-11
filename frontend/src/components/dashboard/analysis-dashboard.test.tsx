import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalysisDashboard } from "./analysis-dashboard";
import { ApiClientError, apiFetch } from "@/lib/api";

const router = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
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

describe("AnalysisDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiClientError("Unauthorized request", 401),
    );

    render(createElement(AnalysisDashboard));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows validation before calling the analysis endpoint", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: { _id: "u1", username: "demo", email: "demo@e.co" },
      msg: "Current user fetched",
    });

    render(createElement(AnalysisDashboard));

    expect(await screen.findByText(hasText("Welcome, demo"))).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Job description or URL"), {
      target: { value: "short" },
    });
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Add a complete job description or URL of at least 30 characters.",
    );
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it("renders a returned analysis result", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        success: true,
        data: { _id: "u1", username: "demo", email: "demo@e.co" },
        msg: "Current user fetched",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          input: "Remote role asks for an upfront equipment fee before interview.",
          sourceUrl: null,
          riskScore: 95,
          verdict: "fake",
          redFlags: ["Requests an upfront payment"],
          greenFlags: [],
        },
        msg: "Analysis complete",
      });

    render(createElement(AnalysisDashboard));

    await screen.findByText(hasText("Welcome, demo"));
    fireEvent.change(screen.getByLabelText("Job description or URL"), {
      target: {
        value: "Remote role asks for an upfront equipment fee before interview.",
      },
    });
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    expect(
      await screen.findByLabelText("Risk score 95 out of 100"),
    ).toBeInTheDocument();
    expect(screen.getByText("Requests an upfront payment")).toBeInTheDocument();
  });

  it("shows API analysis errors", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        success: true,
        data: { _id: "u1", username: "demo", email: "demo@e.co" },
        msg: "Current user fetched",
      })
      .mockRejectedValueOnce(new ApiClientError("AI provider unavailable", 502));

    render(createElement(AnalysisDashboard));

    await screen.findByText(hasText("Welcome, demo"));
    fireEvent.change(screen.getByLabelText("Job description or URL"), {
      target: {
        value: "Remote role asks for an upfront equipment fee before interview.",
      },
    });
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "AI provider unavailable",
    );
  });
});

function hasText(text: string) {
  return (_content: string, element: Element | null): boolean =>
    element?.textContent === text;
}
