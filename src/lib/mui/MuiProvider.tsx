/**
 * Wraps the application with Material UI's ThemeProvider and CssBaseline.
 * This must be a Client Component because ThemeProvider relies on React context.
 * Placed high in the tree (inside RootLayout) so all MUI components receive
 * the custom dark vault theme automatically.
 * 
 * @packageDocumentation
 */
"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

/**
 * Global MUI provider — injects the vault colour theme and CSS reset.
 * Wrap the entire app with this so MUI dialogs, tooltips, and portals
 * all inherit the correct dark mode palette.
 */
export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
