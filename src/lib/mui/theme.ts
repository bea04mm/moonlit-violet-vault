/**
 * Custom Material UI theme for the Moonlit Violet Vault.
 * Palette colours are aligned with the CSS custom properties defined in globals.css
 * so that MUI components and Tailwind utilities always match visually.
 * 
 * @packageDocumentation
 */
"use client";

import { createTheme } from "@mui/material/styles";

// A custom dark theme matching the vault's moonlit violet aesthetic
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8b5cf6",        // --color-violet-500
      dark: "#7c3aed",        // --color-violet-600
      light: "#a78bfa",       // --color-violet-400
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#4ade80",        // Starlight/Green accent
    },
    error: {
      main: "#f87171",        // Red 400 — used for delete actions
    },
    background: {
      default: "#110e1f",     // --color-lunar-950 (page background)
      paper: "#1e1833",       // --color-lunar-900 (cards and modals)
    },
    text: {
      primary: "#f9fafb",     // --color-lunar-50
      secondary: "#9ca3af",   // --color-lunar-400
    },
  },
  typography: {
    // Inherit the Next.js Google font variables injected in RootLayout
    fontFamily: "inherit",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem", // rounded-xl — matches the vault card radius
          textTransform: "none",   // No ALL-CAPS labels
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem", // rounded-lg
        },
      },
    },
  },
});

export default theme;
