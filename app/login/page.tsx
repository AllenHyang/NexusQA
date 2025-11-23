"use client";

import React from "react";
import { LoginView } from "@/views/LoginView";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { users, login, currentUser } = useAppStore();
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  return <LoginView users={users} onLogin={login} />;
}
