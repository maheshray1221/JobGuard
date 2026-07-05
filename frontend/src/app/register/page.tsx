import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a JobGuard account and start checking job listings.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Get protected"
      title="Create your account"
      description="Save your checks and make safer career decisions."
    >
      <RegisterForm />
    </AuthShell>
  );
}
