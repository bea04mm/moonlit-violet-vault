/**
 * Root-level error boundary (Next.js `global-error.tsx` convention).
 * Catches unhandled errors that occur outside the `(vault)` layout, including
 * errors in the root layout itself. Must render its own `<html>` and `<body>` tags
 * because the root layout may not be available when this component renders.
 * 
 * @packageDocumentation
 */
'use client'

import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Root-level error boundary — catches errors in the root layout.
 * Must include <html> and <body> tags per Next.js spec.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f', color: '#e2d9f3', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '24px', textAlign: 'center', padding: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WarningAmberIcon sx={{ fontSize: 32, color: '#ef4444' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#e2d9f3' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '320px', margin: '0 auto' }}>
            {error.digest ? `Error ID: ${error.digest}` : 'A critical error occurred. Please try again.'}
          </p>
        </div>
        <button
          onClick={() => unstable_retry()}
          style={{ padding: '12px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
