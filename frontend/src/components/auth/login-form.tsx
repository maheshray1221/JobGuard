"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientError, apiFetch } from "@/lib/api";

const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(3, "Enter a valid username or email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: "", password: "" },
  });

  const onSubmit = async ({ identity, password }: LoginValues) => {
    const isEmail = identity.includes("@");

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          [isEmail ? "email" : "username"]: identity.trim().toLowerCase(),
          password,
        }),
        skipRefresh: true,
      });
      toast.success("Welcome back");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Could not connect to JobGuard";
      setError("root", { message });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="identity">Username or email</Label>
        <Input
          id="identity"
          autoComplete="username"
          placeholder="you@example.com"
          className="h-11 bg-white dark:bg-slate-950"
          aria-invalid={Boolean(errors.identity)}
          {...register("identity")}
        />
        {errors.identity && (
          <p className="text-sm text-rose-600">{errors.identity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-rose-600">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        New to JobGuard?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
