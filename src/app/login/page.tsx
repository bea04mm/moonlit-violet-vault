// src/app/login/page.tsx
// Login page — the only publicly accessible route.
// Presents a Google OAuth sign-in button with the vault aesthetic.

import type { Metadata } from "next";
import { LoginButton } from "@/components/auth/LoginButton";
import NightlightIcon from "@mui/icons-material/Nightlight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access the personal media vault.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="min-h-screen flex items-center justify-center vault-gradient px-4">
      {/* Decorative orbs */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-violet-500) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-blossom-400) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 text-[var(--color-violet-400)]" aria-hidden="true">
            <NightlightIcon style={{ fontSize: 56 }} />
          </div>
          <h1
            className="text-3xl font-display font-bold text-gradient-violet mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Moonlit Violet Vault
          </h1>
          <p className="text-sm" style={{ color: "var(--color-lunar-400)" }}>
            A personal media sanctuary
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card rounded-3xl p-8 flex flex-col gap-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="text-center">
            <h2
              className="text-lg font-semibold mb-1 flex items-center justify-center gap-1.5"
              style={{ color: "var(--color-lunar-100)" }}
            >
              Welcome back <AutoAwesomeIcon style={{ fontSize: 18, color: "var(--color-violet-400)" }} />
            </h2>
            <p className="text-sm" style={{ color: "var(--color-lunar-400)" }}>
              Sign in with a Google account to enter the vault.
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center border"
              style={{
                background:
                  "color-mix(in srgb, var(--color-blossom-500) 10%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--color-blossom-500) 30%, transparent)",
                color: "var(--color-blossom-300)",
              }}
            >
              {error === "unauthorized"
                ? "This Google account doesn't have access to the vault."
                : "Sign-in failed. Please try again."}
            </div>
          )}

          <LoginButton />

          <p
            className="text-xs text-center"
            style={{ color: "var(--color-lunar-600)" }}
          >
            Access is restricted to the vault owner.
          </p>
        </div>
      </div>
    </main>
  );
}
