"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const check = () => {
      const authed = localStorage.getItem("admin_authenticated") === "true";
      setIsAuthed(authed);
      if (!authed && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    };
    check();
  }, [router, pathname]);

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Withdrawals", href: "/admin/withdrawals" },
    { label: "Settings", href: "/admin/settings" },
  ];

  if (pathname === "/admin/login") return <>{children}</>;

  if (isAuthed === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-4 fixed">
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-white">Admin Panel</span>
              <p className="text-xs text-slate-400">Salman Trading</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Back to Site
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("admin_authenticated");
                router.push("/admin/login");
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="ml-64 flex-1 p-4 sm:p-6 responsive-table">
          {children}
        </main>
      </div>
    </div>
  );
}
