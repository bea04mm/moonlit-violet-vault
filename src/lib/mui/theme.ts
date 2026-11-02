/**
 * Lean Material UI theme configuration for the Moonlit Violet Vault.
 * Aligned with the Linear / Raycast Dark Craft palette and Warm Paper Craft Light palette.
 * Palette colours are aligned with the CSS custom properties defined in globals.css
 * so that MUI components and Tailwind utilities always match visually.
 *
 * @packageDocumentation
 */
"use client"

import { createTheme } from "@mui/material/styles"
import type {} from "@mui/x-date-pickers/themeAugmentation"

/**
 * Material UI theme configuration for Dark Craft mode.
 * A custom dark theme matching the vault's moonlit violet aesthetic.
 */
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b470ff",
      dark: "#8230f0",
      light: "#dbbfff",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#34d399",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#0a0910",
      paper: "#13111c",
    },
    text: {
      primary: "#ede0ff",
      secondary: "#dbbfff",
    },
    divider: "rgba(180, 112, 255, 0.18)",
  },
  typography: {
    fontFamily: "inherit",
  },
})

/**
 * Material UI theme configuration for Warm Paper Craft Light mode.
 */
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7e22ce",
      dark: "#581c87",
      light: "#9333ea",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#059669",
    },
    error: {
      main: "#dc2626",
    },
    background: {
      default: "#f5f2fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#26123e",
      secondary: "#5c457d",
    },
    divider: "#d8cee8",
  },
  typography: {
    fontFamily: "inherit",
  },
})
