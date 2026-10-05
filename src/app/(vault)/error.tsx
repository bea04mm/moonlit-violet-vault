/**
 * Vault-scoped error boundary (Next.js `error.tsx` convention).
 * Catches runtime errors inside the `(vault)` route group and shows a friendly
 * recovery UI with an error digest and a "Try again" button.
 * Logs the error to the console for debugging purposes.
 * 
 * @packageDocumentation
 */
'use client'

import { useEffect } from 'react';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Error boundary for all vault routes — catches DB failures, network errors, etc.
 */
export default function VaultError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[VaultError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-blossom-500) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-blossom-500) 30%, transparent)' }}>
        <ErrorOutlinedIcon sx={{ fontSize: 40, color: 'var(--color-blossom-400)' }} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-lunar-100)', fontFamily: 'var(--font-display)' }}>
          Something went wrong
        </h1>
        <p className="text-sm max-w-sm" style={{ color: 'var(--color-lunar-500)' }}>
          {error.digest ? `Error ID: ${error.digest}` : 'An unexpected error occurred while loading.'}
        </p>
      </div>
      <button
        onClick={() => unstable_retry()}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all"
        style={{ background: 'var(--color-violet-600)', color: 'white' }}
      >
        <RefreshIcon fontSize="small" />
        Try again
      </button>
    </div>
  );
}
