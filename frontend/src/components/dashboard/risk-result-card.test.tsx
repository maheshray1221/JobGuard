import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { RiskResultCard } from "./risk-result-card";

describe("RiskResultCard", () => {
  it("renders a high-risk result with explainable signals", () => {
    render(
      createElement(RiskResultCard, {
        result: {
          input: "Remote role requiring an upfront registration payment.",
          sourceUrl: null,
          riskScore: 72,
          verdict: "fake",
          redFlags: ["Requests an upfront payment"],
          greenFlags: ["Lists specific responsibilities"],
        },
      }),
    );

    expect(screen.getByText("High risk")).toBeInTheDocument();
    expect(screen.getByLabelText("Risk score 72 out of 100")).toBeInTheDocument();
    expect(
      screen.getByText("Requests an upfront payment"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lists specific responsibilities"),
    ).toBeInTheDocument();
  });
});
