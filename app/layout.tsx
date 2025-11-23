import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UIProvider } from "@/contexts/UIContext";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Nexus QA",
  description: "AI-Powered Test Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <UIProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </UIProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
