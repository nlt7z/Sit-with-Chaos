"use client";

import "./globals.css";

/**
 * Root-level error UI — replaces the entire document on uncaught errors.
 * Defining this explicitly avoids Next 16 RSC client-manifest issues with the built-in global-error stub.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white px-6 py-16 font-sans text-[#1D1D1F] antialiased">
        <main className="mx-auto max-w-md">
          <h1 className="font-mono text-xs font-medium uppercase tracking-widest text-[#6E6E73]">Error</h1>
          <p className="mt-4 text-lg font-normal leading-snug">Something went wrong while loading this page.</p>
          {process.env.NODE_ENV === "development" && error?.message ? (
            <pre className="mt-6 overflow-x-auto rounded-lg bg-neutral-100 p-4 text-left text-xs leading-relaxed text-neutral-800">
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-[#1D1D1F] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
