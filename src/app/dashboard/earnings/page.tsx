"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import CountdownTimer from "@/components/countdown-timer";

export default function EarningsPage() {
  const { user } = useAuth();

  const investments = (user as any)?.investments || [];
  const activeInvestments = investments.filter((inv: any) => inv.status === "active");
  const completedInvestments = investments.filter((inv: any) => inv.status === "completed");
  const earnings = ((user as any)?.transactions || []).filter((t: any) => t.type === "earning");

  const totalDailyProfit = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.daily_profit), 0);
  const totalExpectedReturn = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.total_profit), 0);
  const totalAccumulated = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.daily_profit) * Number(inv.days_completed), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Earnings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your daily profits and investment progress
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Daily Profit</p>
            <p className="text-2xl font-bold text-emerald-400">Rs {formatNumber(totalDailyProfit)}</p>
            <p className="text-xs text-slate-500 mt-1">Across all active plans</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Accumulated Earnings</p>
            <p className="text-2xl font-bold text-amber-400">Rs {formatNumber(totalAccumulated)}</p>
            <p className="text-xs text-slate-500 mt-1">Total earned so far</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Expected Total Return</p>
            <p className="text-2xl font-bold text-blue-400">Rs {formatNumber(totalExpectedReturn)}</p>
            <p className="text-xs text-slate-500 mt-1">At plan completion</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Active Plans</p>
            <p className="text-2xl font-bold text-purple-400">{activeInvestments.length}</p>
            <p className="text-xs text-slate-500 mt-1">Currently earning</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Investment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {activeInvestments.length > 0 ? (
            <div className="space-y-5">
              {activeInvestments.map((inv: any) => {
                const earned = Number(inv.daily_profit) * Number(inv.days_completed);
                const progressPercent = Math.round((Number(inv.days_completed) / Number(inv.duration)) * 100);
                return (
                  <div key={inv.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-100">{inv.package_name}</h4>
                        <p className="text-xs text-slate-400">Rs {formatNumber(inv.amount)} invested</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="active">Active</Badge>
                        <p className="text-xs text-slate-400 mt-1">{progressPercent}% complete</p>
                      </div>
                    </div>
                    <Progress value={Number(inv.days_completed)} max={Number(inv.duration)} className="mb-4" />
                    <div className="grid grid-cols-4 gap-3 items-center">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Daily</p>
                        <p className="text-sm font-semibold text-emerald-400">Rs {formatNumber(inv.daily_profit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Earned</p>
                        <p className="text-sm font-semibold text-amber-400">Rs {formatNumber(earned)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-sm font-semibold text-blue-400">Rs {formatNumber(inv.total_profit)}</p>
                      </div>
                      <div className="border-l border-slate-700/50 pl-3">
                        <CountdownTimer lastEarningAt={inv.last_earning_at} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No active investments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {completedInvestments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedInvestments.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div>
                    <h4 className="font-semibold text-slate-100">{inv.package_name}</h4>
                    <p className="text-xs text-slate-400">Rs {formatNumber(inv.amount)} &bull; {inv.duration} days</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="completed">Completed</Badge>
                    <p className="text-sm font-semibold text-emerald-400 mt-1">Rs {formatNumber(inv.total_profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length > 0 ? (
            <div className="space-y-2">
              {earnings.slice(0, 10).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{tx.description}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">+Rs {formatNumber(tx.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No earnings recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
