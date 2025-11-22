"use client";

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('../AppShell').then(mod => mod.AppShell), { ssr: false });

export default function Page() {
  return <AppShell />;
}