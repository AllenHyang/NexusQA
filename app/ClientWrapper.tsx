"use client";

import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </ThemeProvider>
  );
}
