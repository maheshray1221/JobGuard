import { describe, expect, it } from "vitest";
import { fetchAndParseURL } from "./urlParser.js";

describe("fetchAndParseURL security", () => {
  it.each([
    "http://localhost/job",
    "http://127.0.0.1/job",
    "http://10.0.0.1/job",
    "http://192.168.1.1/job",
    "file:///etc/passwd",
  ])("rejects unsafe URL %s", async (url) => {
    await expect(fetchAndParseURL(url)).rejects.toMatchObject({
      statusCode: 422,
    });
  });
});
