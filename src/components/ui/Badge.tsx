// src/components/ui/Badge.tsx
// Primitive badge component — used for status labels, genres, media types.

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "violet" | "blossom" | "starlight" | "muted";
}

const VARIANT_STYLES: Record<string, string> = {
  default:
    "bg-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] text-[var(--color-violet-300)] border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)]",
  violet:
    "bg-[color-mix(in_srgb,var(--color-violet-500)_20%,transparent)] text-[var(--color-violet-200)] border-[color-mix(in_srgb,var(--color-violet-400)_40%,transparent)]",
  blossom:
    "bg-[color-mix(in_srgb,var(--color-blossom-500)_15%,transparent)] text-[var(--color-blossom-300)] border-[color-mix(in_srgb,var(--color-blossom-400)_30%,transparent)]",
  starlight:
    "bg-[color-mix(in_srgb,var(--color-starlight-500)_15%,transparent)] text-[var(--color-starlight-400)] border-[color-mix(in_srgb,var(--color-starlight-500)_30%,transparent)]",
  muted:
    "bg-[color-mix(in_srgb,var(--color-lunar-700)_50%,transparent)] text-[var(--color-lunar-400)] border-[color-mix(in_srgb,var(--color-lunar-600)_40%,transparent)]",
};

export function Badge({
  children,
  className = "",
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
