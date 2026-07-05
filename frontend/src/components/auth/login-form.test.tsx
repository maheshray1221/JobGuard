import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const router = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

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
    expect(router.push).not.toHaveBeenCalled();
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
});
