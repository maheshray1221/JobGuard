import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./register-form";
import { ApiClientError, apiFetch } from "@/lib/api";

const router = {
  replace: vi.fn(),
  refresh: vi.fn(),
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

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an account and replaces history with login", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: null,
      msg: "User registered successfully",
    });

    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText("Username"), "Demo_User");
    await user.type(screen.getByLabelText("Email"), "DEMO@e.co");
    await user.type(screen.getByLabelText("Password"), "secure123");
    await user.type(screen.getByLabelText("Confirm"), "secure123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "demo_user",
          email: "demo@e.co",
          password: "secure123",
        }),
        skipRefresh: true,
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/login");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows API errors without redirecting", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiClientError("Email or username already exists", 409),
    );

    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText("Username"), "demo_user");
    await user.type(screen.getByLabelText("Email"), "demo@e.co");
    await user.type(screen.getByLabelText("Password"), "secure123");
    await user.type(screen.getByLabelText("Confirm"), "secure123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or username already exists",
    );
    expect(router.replace).not.toHaveBeenCalled();
  });
});
