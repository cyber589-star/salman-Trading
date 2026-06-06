"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { INVESTMENT_PACKAGES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export default function InvestPage() {
  const { user, invest, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selectedPackage = INVESTMENT_PACKAGES.find((p) => p.id === selectedPlan);

  async function handleInvest() {
    if (!selectedPackage) return;
    if ((user?.balance || 0) < selectedPackage.investment) {
      toast("error", "Insufficient balance", "Please deposit funds first.");
      setSelectedPlan(null);
      setConfirming(false);
      return;
    }
    const success = await invest(selectedPackage.id);
    if (success) {
      toast("success", "Investment successful!", `You invested in ${selectedPackage.name} plan.`);
      await refreshUser();
    } else {
      toast("error", "Investment failed", "Please check your balance.");
    }
    setSelectedPlan(null);
    setConfirming(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Investment Plans</h1>
        <p className="text-slate-400 text-sm mt-1">
          Choose a plan that fits your investment goals. Balance: Rs {formatNumber(user?.balance || 0)}
        </p>
      </div>

      {confirming && selectedPackage ? (
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Confirm Investment</h3>
              <p className="text-sm text-slate-400">You are about to invest in the following plan</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Plan</span>
                <span className="text-sm font-semibold text-white">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Investment</span>
                <span className="text-sm font-semibold text-white">Rs {formatNumber(selectedPackage.investment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Daily Profit</span>
                <span className="text-sm font-semibold text-emerald-400">Rs {formatNumber(selectedPackage.dailyProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Total Return</span>
                <span className="text-sm font-semibold text-white">Rs {formatNumber(selectedPackage.totalProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Duration</span>
                <span className="text-sm font-semibold text-white">{selectedPackage.duration} days</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setConfirming(false); setSelectedPlan(null); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleInvest}>
                Confirm Investment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INVESTMENT_PACKAGES.map((pkg) => {
            const canAfford = (user?.balance || 0) >= pkg.investment;
            return (
              <Card
                key={pkg.id}
                variant={pkg.id >= 7 ? "premium" : "default"}
                className={`relative overflow-hidden transition-all ${
                  selectedPlan === pkg.id ? "ring-2 ring-emerald-500" : ""
                }`}
              >
                <CardContent className="p-5">
                  {pkg.id >= 7 && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        PREMIUM
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">Investment Plan</p>
                  </div>

                  <div className={`rounded-xl p-3 mb-4 bg-gradient-to-r ${pkg.color}`}>
                    <p className="text-xs text-white/80 mb-0.5">Investment Amount</p>
                    <p className="text-xl font-bold text-white">Rs {pkg.investment.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Daily Profit</span>
                      <span className="font-semibold text-emerald-400">+Rs {pkg.dailyProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Return</span>
                      <span className="font-semibold text-white">Rs {pkg.totalProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="font-semibold text-white">{pkg.duration} Days</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={canAfford ? "primary" : "secondary"}
                    disabled={!canAfford}
                    onClick={() => {
                      setSelectedPlan(pkg.id);
                      setConfirming(true);
                    }}
                  >
                    {canAfford ? "Invest Now" : "Insufficient Balance"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
