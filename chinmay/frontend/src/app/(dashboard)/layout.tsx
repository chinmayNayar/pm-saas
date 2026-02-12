"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useOrgStore } from "../../store/orgStore";
import { axiosClient } from "../../lib/axiosClient";
import { Sidebar } from "../../components/layout/sidebar";
import { Topbar } from "../../components/layout/topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const { setOrgs, setCurrentOrg, currentOrg } = useOrgStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    if (!user) return;
    axiosClient
      .get("/organizations")
      .then((res) => {
        const orgs = res.data?.data ?? [];
        setOrgs(orgs);
        if (orgs.length > 0 && !currentOrg) {
          setCurrentOrg(orgs[0]);
        }
      })
      .catch(() => setOrgs([]));
  }, [user, setOrgs, setCurrentOrg, currentOrg]);

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

