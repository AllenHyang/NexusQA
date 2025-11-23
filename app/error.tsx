"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-10">
      <h2 className="text-xl font-bold text-zinc-800 mb-2">Application Error</h2>
      <p className="text-zinc-500 mb-6 text-center max-w-md">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
