"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();

  const investments = (user as any)?.investments || [];
  const transactions = (user as any)?.transactions || [];

  const stats = [
    {
      title: "Available Balance",
      value: `Rs ${formatNumber(user?.balance || 0)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Invested",
      value: `Rs ${formatNumber(user?.total_invested || 0)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Earnings",
      value: `Rs ${formatNumber(user?.total_earnings || 0)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Active Plans",
      value: `${investments.filter((i: any) => i.status === "active").length || 0}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back, {user?.username}! Here&apos;s your portfolio overview.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{stat.title}</span>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Investments</CardTitle>
          <Link
            href="/dashboard/invest"
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {investments.filter((i: any) => i.status === "active").length > 0 ? (
            <div className="space-y-4">
              {investments
                .filter((i: any) => i.status === "active")
                .slice(0, 3)
                .map((inv: any) => (
                  <div key={inv.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-100">{inv.package_name}</h4>
                        <p className="text-xs text-slate-400">Rs {formatNumber(inv.amount)} invested</p>
                      </div>
                      <Badge variant="active">Active</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-200">
                          {inv.days_completed}/{inv.duration} days
                        </span>
                      </div>
                      <Progress value={inv.days_completed} max={inv.duration} />
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">+Rs {formatNumber(inv.daily_profit)}/day</span>
                        <span className="text-slate-300">Rs {formatNumber(inv.total_profit)} total</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm mb-3">No active investments yet</p>
              <Link
                href="/dashboard/invest"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Start Investing
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link
            href="/dashboard/history"
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.type === "deposit"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : tx.type === "withdrawal"
                        ? "bg-red-500/10 text-red-400"
                        : tx.type === "investment"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {tx.type === "deposit" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
                      {tx.type === "withdrawal" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
                      {tx.type === "investment" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                      {tx.type === "earning" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 capitalize">{tx.type}</p>
                      <p className="text-xs text-slate-500">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === "deposit" || tx.type === "earning" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {tx.type === "deposit" || tx.type === "earning" ? "+" : "-"}Rs {formatNumber(tx.amount)}
                    </p>
                    <Badge variant={tx.status === "completed" || tx.status === "approved" ? "completed" : tx.status === "pending" ? "pending" : "rejected"} className="text-[10px]">
                      {tx.status === "approved" ? "completed" : tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/deposit">
          <Card className="hover:border-emerald-500/50 transition-colors group cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Deposit Funds</h4>
                <p className="text-xs text-slate-400">Add money to wallet</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/invest">
          <Card className="hover:border-blue-500/50 transition-colors group cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Invest Now</h4>
                <p className="text-xs text-slate-400">Choose a plan</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/withdraw">
          <Card className="hover:border-red-500/50 transition-colors group cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Withdraw</h4>
                <p className="text-xs text-slate-400">Request payout</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
