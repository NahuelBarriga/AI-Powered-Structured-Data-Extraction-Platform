"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "@/src/lib/api";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => { //on mount
    const onboard = async () => {
      try {
        await apiClient.baseApi.post("/api/onboard", {});
      } catch {
        // does nothing if already onboarded
      }
    };

    void onboard();
  }, []);

  return <>{children}</>;
}
