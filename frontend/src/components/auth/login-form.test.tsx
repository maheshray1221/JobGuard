import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";
import { ApiClientError, apiFetch } from "@/lib/api";

const router = {
  push: vi.fn(),
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

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation messages for incomplete credentials", async () => {
    const user = userEvent.setup();
    render(createElement(LoginForm));

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Enter a valid username or email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 5 characters"),
    ).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("toggles password visibility accessibly", async () => {
    const user = userEvent.setup();
    render(createElement(LoginForm));

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });

  it("signs in and replaces history with the dashboard", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: null,
      msg: "User successfully logged in",
    });

    render(createElement(LoginForm));

    await user.type(screen.getByLabelText("Username or email"), "demo_user");
    await user.type(screen.getByLabelText("Password"), "secure123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "demo_user",
          password: "secure123",
        }),
        skipRefresh: true,
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows API errors without redirecting", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiClientError("Invalid credentials", 401),
    );

    render(createElement(LoginForm));

    await user.type(screen.getByLabelText("Username or email"), "demo_user");
    await user.type(screen.getByLabelText("Password"), "wrong123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(router.replace).not.toHaveBeenCalled();
  });
});
