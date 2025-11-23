import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F2F0E9]">
      <h2 className="text-4xl font-black text-zinc-900 mb-2">404</h2>
      <p className="text-zinc-500 mb-6">Page not found</p>
      <Link
        href="/"
        className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
