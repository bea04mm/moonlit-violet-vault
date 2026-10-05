/**
 * A tiny reusable pill-shaped badge component for status indicators, genres, etc.
 *
 * @packageDocumentation
 */
import type { ReactNode } from "react";

/**
 * The properties available to customize a Badge element.
 */
export interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "violet" | "blossom" | "starlight" | "muted" | "glass";
}

/**
 * Tailwind classes mapped to specific visual variants.
 */
const VARIANT_STYLES: Record<string, string> = {
  default:
    "bg-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] text-(--color-violet-300) border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)]",
  violet:
    "bg-[color-mix(in_srgb,var(--color-violet-500)_20%,transparent)] text-(--color-violet-200) border-[color-mix(in_srgb,var(--color-violet-400)_40%,transparent)]",
  blossom:
    "bg-[color-mix(in_srgb,var(--color-blossom-500)_15%,transparent)] text-(--color-blossom-300) border-[color-mix(in_srgb,var(--color-blossom-400)_30%,transparent)]",
  starlight:
    "bg-[color-mix(in_srgb,var(--color-starlight-500)_15%,transparent)] text-(--color-starlight-400) border-[color-mix(in_srgb,var(--color-starlight-500)_30%,transparent)]",
  muted:
    "bg-[color-mix(in_srgb,var(--color-lunar-700)_50%,transparent)] text-(--color-lunar-400) border-[color-mix(in_srgb,var(--color-lunar-600)_40%,transparent)]",
  glass:
    "bg-[rgba(255,255,255,0.1)] text-(--color-lunar-100) border-[rgba(255,255,255,0.2)] backdrop-blur-sm shadow-sm",
};

/**
 * Primitive badge component — used for status labels, genres, media types.
 */
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
