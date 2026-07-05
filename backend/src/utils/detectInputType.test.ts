import { describe, expect, it } from "vitest";
import { detectInputType } from "./detectInputType.js";

describe("detectInputType", () => {
  it.each([
    "https://example.com/jobs/123",
    "http://example.com/job",
    "www.example.com/careers",
  ])("recognizes a supported URL: %s", (input) => {
    expect(detectInputType(input)).toBe("url");
  });

  it.each([
    "Apply immediately for this software role",
    "ftp://example.com/job",
    "example.com/jobs/123",
  ])("treats non-HTTP URL input as pasted text: %s", (input) => {
    expect(detectInputType(input)).toBe("paste");
  });
});
