/**
 * Root-level error boundary (Next.js `global-error.tsx` convention).
 * Catches unhandled errors that occur outside the `(vault)` layout, including
 * errors in the root layout itself. Must render its own `<html>` and `<body>` tags
 * because the root layout may not be available when this component renders.
 *
 * @packageDocumentation
 */
"use client"

import WarningAmberIcon from "@mui/icons-material/WarningAmber"

/**
 * Root-level error boundary — catches errors in the root layout.
 * Must include <html> and <body> tags per Next.js spec.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root { --ge-bg: #0a0910; --ge-fg: #f8f6ff; --ge-card: #13111c; --ge-border: rgba(180, 112, 255, 0.35); --ge-muted: #c084fc; }
          @media (prefers-color-scheme: light) {
            :root { --ge-bg: #f3f0f7; --ge-fg: #26123e; --ge-card: #ffffff; --ge-border: #d8cee8; --ge-muted: #584975; }
          }
        `}</style>
      </head>
      <body
        style={{
          background: "var(--ge-bg)",
          color: "var(--ge-fg)",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          textAlign: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 24, color: "#ef4444" }} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "6px",
              color: "var(--ge-fg)",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--ge-muted)",
              maxWidth: "320px",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            {error.digest
              ? `Error ID: ${error.digest}`
              : "A critical error occurred. Please try again."}
          </p>
        </div>
        <button
          onClick={() => unstable_retry()}
          style={{
            padding: "8px 18px",
            background: "var(--ge-card)",
            color: "var(--ge-fg)",
            border: "1px solid var(--ge-border)",
            borderRadius: "10px",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "0.8125rem",
            marginTop: "8px",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
