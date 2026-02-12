"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const refresh = useAuthStore((s) => s.refresh);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    (async () => {
      await refresh();
      await fetchMe();
    })();
  }, [refresh, fetchMe]);

  return <>{children}</>;
}

