import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to analyze job listings and review your history.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to JobGuard"
      description="Continue to your analyses and check a new opportunity."
    >
      <LoginForm />
    </AuthShell>
  );
}
