"use client";

import ClientLayout from "./ClientLayout";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}
