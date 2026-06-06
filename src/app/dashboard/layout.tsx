"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (user === null) {
      done.current = true;
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 lg:ml-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
