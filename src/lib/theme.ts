"use client";

import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8b5cf6", // --color-violet-500
      dark: "#7c3aed", // --color-violet-600
      light: "#a78bfa", // --color-violet-400
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#4ade80", // Starlight/Green
    },
    error: {
      main: "#f87171", // Red 400
    },
    background: {
      default: "#110e1f", // --color-lunar-950
      paper: "#1e1833", // --color-lunar-900 for cards/modals
    },
    text: {
      primary: "#f9fafb", // --color-lunar-50
      secondary: "#9ca3af", // --color-lunar-400
    },
  },
  typography: {
    fontFamily: "inherit", // Inherit Next.js Geist Sans font
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem", // rounded-xl
          textTransform: "none",
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
