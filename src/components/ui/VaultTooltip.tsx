/**
 * Styled tooltip wrapper rendered via MUI Portal so tooltips float above scrollable rails.
 *
 * @packageDocumentation
 */
"use client"

import Tooltip, { type TooltipProps } from "@mui/material/Tooltip"

/**
 * Moonlit Violet Vault styled tooltip. Passes through an empty title when `enabled` is false
 * so wrapped interactive elements stay mounted without losing focus or emitting disabled-child warnings.
 */
export function VaultTooltip({
  label,
  enabled = true,
  placement = "top",
  desktopOnly = false,
  children,
}: {
  label: string
  enabled?: boolean
  placement?: TooltipProps["placement"]
  desktopOnly?: boolean
  children: TooltipProps["children"]
}) {
  return (
    <Tooltip
      title={enabled ? label : ""}
      placement={placement}
      enterDelay={150}
      enterNextDelay={50}
      disableTouchListener
      slotProps={{
        popper: {
          sx: desktopOnly ? { display: { xs: "none", lg: "block" }, zIndex: 120 } : { zIndex: 120 },
          modifiers: [{ name: "offset", options: { offset: [0, 6] } }],
        },
        tooltip: {
          sx: {
            margin: "0 !important",
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card-hover)",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: 1.2,
            padding: "6px 10px",
          },
        },
      }}
    >
      {children}
    </Tooltip>
  )
}
