"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";

export default function WithdrawPage() {
  const { user, withdraw } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminWhatsapp, setAdminWhatsapp] = useState("923043310635");
  const [checking, setChecking] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  useEffect(() => {
    const load = async () => {
      const sb = await getSupabase();
      const { data: settings } = await sb.from("settings").select("*");
      const map: Record<string, string> = {};
      (settings || []).forEach((s: any) => { map[s.key] = s.value; });
      if (map.admin_whatsapp) setAdminWhatsapp(map.admin_whatsapp);

      if (user) {
        const { data: investments } = await sb
          .from("investments")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1);
        setHasActivePlan((investments?.length || 0) > 0);
      }
      setChecking(false);
    };
    load();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 60) {
      toast("error", "Invalid amount", "Minimum withdrawal is Rs 60.");
      return;
    }
    if ((user?.balance || 0) < numAmount) {
      toast("error", "Insufficient balance");
      return;
    }
    if (!accountNumber || !accountName) {
      toast("error", "Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    const success = await withdraw(numAmount, accountNumber, accountName);
    if (success) {
      toast("success", "Withdrawal request submitted!", "Contact admin on WhatsApp to complete.");
      setAmount("");
      setAccountNumber("");
      setAccountName("");
    } else {
      toast("error", "Withdrawal failed", "Check your balance and active plans.");
    }
    setIsSubmitting(false);
  }

  const quickAmounts = [60, 200, 500, 1000, 5000];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
        <p className="text-slate-400 text-sm mt-1">
          Available balance: Rs {formatNumber(user?.balance || 0)} &bull; Min withdrawal: Rs 60
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            {checking ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !hasActivePlan ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Buy a Plan First</h3>
                <p className="text-sm text-slate-400 mb-4">
                  You need to purchase an investment plan before you can withdraw.
                </p>
                <a href="/dashboard/invest">
                  <Button>View Investment Plans</Button>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-sm text-slate-300">
                    After submitting, contact admin on WhatsApp to process your withdrawal.
                  </p>
                  <a
                    href={`https://wa.me/${adminWhatsapp}?text=Hi%20Salman%20Trading%2C%20I%20requested%20a%20withdrawal%20of%20Rs${amount || "____"}%20from%20my%20account.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>

                <div>
                  <Label>Withdrawal Method</Label>
                  <div className="mt-1.5 p-4 rounded-xl border border-amber-500 bg-amber-500/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-100">JazzCash</p>
                      <p className="text-xs text-slate-400">Mobile Account</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="w-amount">Withdrawal Amount (Rs)</Label>
                  <Input
                    id="w-amount"
                    type="number"
                    placeholder="Enter amount (min Rs 60)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5"
                    min={60}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickAmounts.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a.toString())}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                      >
                        Rs {a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="acc-name">Account Holder Name</Label>
                  <Input
                    id="acc-name"
                    placeholder="Enter name as per CNIC"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="acc-number">JazzCash Account Number</Label>
                  <Input
                    id="acc-number"
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Request Withdrawal
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {(user?.transactions || []).filter((t: any) => t.type === "withdrawal").length > 0 ? (
              <div className="space-y-2">
                {(user?.transactions || [])
                  .filter((t: any) => t.type === "withdrawal")
                  .slice(0, 5)
                  .map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <div>
                        <p className="text-sm font-medium text-slate-200">Rs {formatNumber(tx.amount)}</p>
                        <p className="text-xs text-slate-500">{tx.description}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        tx.status === "completed" || tx.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : tx.status === "pending"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">No withdrawal requests yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
