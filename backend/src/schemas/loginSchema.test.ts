import { describe, expect, it } from "vitest";
import { loginSchema } from "./loginSchema.js";

describe("loginSchema", () => {
  it("accepts and normalizes a username", () => {
    const result = loginSchema.parse({
      username: "  Demo_User  ",
      password: "secure123",
    });

    expect(result.username).toBe("demo_user");
  });

  it("accepts and normalizes an email", () => {
    const result = loginSchema.parse({
      email: "  Demo@Example.COM ",
      password: "secure123",
    });

    expect(result.email).toBe("demo@example.com");
  });

  it("requires either username or email", () => {
    const result = loginSchema.safeParse({ password: "secure123" });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secure123",
    });

    expect(result.success).toBe(false);
  });
});
