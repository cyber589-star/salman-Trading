"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";

type FilterType = "all" | "deposit" | "withdrawal" | "investment" | "earning";

export default function HistoryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const transactions = ((user as any)?.transactions || []).filter((t: any) =>
    filter === "all" ? true : t.type === filter
  );

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Deposits", value: "deposit" },
    { label: "Withdrawals", value: "withdrawal" },
    { label: "Investments", value: "investment" },
    { label: "Earnings", value: "earning" },
  ];

  const typeIcons: Record<string, { bg: string; icon: React.ReactNode }> = {
    deposit: {
      bg: "bg-emerald-500/10",
      icon: <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>,
    },
    withdrawal: {
      bg: "bg-red-500/10",
      icon: <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>,
    },
    investment: {
      bg: "bg-blue-500/10",
      icon: <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    earning: {
      bg: "bg-amber-500/10",
      icon: <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-slate-400 text-sm mt-1">View all your transactions in one place</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {transactions.map((tx: any) => {
                const typeConfig = typeIcons[tx.type] || typeIcons.deposit;
                const isPositive = tx.type === "deposit" || tx.type === "earning";
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
                        {typeConfig.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100 capitalize">{tx.type}</p>
                        <p className="text-xs text-slate-400">{tx.description}</p>
                        <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : "-"}Rs {formatNumber(tx.amount)}
                      </p>
                      <Badge
                        variant={tx.status === "completed" || tx.status === "approved" ? "completed" : tx.status === "pending" ? "pending" : "rejected"}
                        className="mt-1"
                      >
                        {tx.status === "approved" ? "completed" : tx.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
