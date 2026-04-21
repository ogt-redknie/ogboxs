"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import LoginApp from "@/components/login/LoginApp";
import StatusBarConfig from "@/components/StatusBarConfig";

export default function LoginPage() {
  const { isLoggedIn, checkAuthStatus } = useStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      checkAuthStatus();
    } catch {}
    const t = window.setTimeout(() => setIsChecking(false), 100);
    return () => window.clearTimeout(t);
  }, [checkAuthStatus]);

  useEffect(() => {
    // Redirect to home if already logged in
    if (!isChecking && isLoggedIn) {
      // Use window.location.replace for Capacitor compatibility
      window.location.replace("/");
    }
  }, [isLoggedIn, isChecking]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting if already logged in
  if (isLoggedIn) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatusBarConfig />
      <LoginApp />
    </>
  );
}
