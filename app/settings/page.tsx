"use client";

import React from "react";
import { SettingsView } from "@/views/SettingsView";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsPage() {
  const { currentUser } = useAppStore();
  
  // Simple state for Jira URL locally for now, or move to UserContext/UIContext
  const [jiraUrl, setJiraUrl] = React.useState(""); 

  if (!currentUser) return null;

  return (
    <SettingsView 
        currentUser={currentUser} 
        jiraUrl={jiraUrl} 
        setJiraUrl={setJiraUrl} 
    />
  );
}
