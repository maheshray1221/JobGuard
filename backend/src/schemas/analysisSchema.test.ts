import { describe, expect, it } from "vitest";
import { analysisSchema } from "./analysisSchema.js";

describe("analysisSchema", () => {
  it("trims and accepts a sufficiently detailed input", () => {
    const result = analysisSchema.parse({
      input: "   This is a sufficiently detailed software engineering role.   ",
    });

    expect(result.input).toBe(
      "This is a sufficiently detailed software engineering role.",
    );
  });

  it("rejects short job descriptions", () => {
    const result = analysisSchema.safeParse({ input: "Short role" });

    expect(result.success).toBe(false);
  });

  it("rejects missing input", () => {
    const result = analysisSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
