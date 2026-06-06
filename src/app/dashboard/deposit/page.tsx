"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export default function DepositPage() {
  const { user, deposit } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "instructions">("form");

  async function handleSubmit() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      toast("error", "Invalid amount", "Minimum deposit is Rs 100.");
      return;
    }
    if (!proofFile) {
      toast("error", "Upload payment proof", "Please upload a screenshot of your payment.");
      return;
    }
    setIsSubmitting(true);
    const success = await deposit(numAmount, "jazzcash", proofFile);
    if (success) {
      toast("success", "Deposit request submitted!", "Your deposit is pending approval.");
      setAmount("");
      setProofFile(null);
      setStep("form");
    } else {
      toast("error", "Failed to submit deposit");
    }
    setIsSubmitting(false);
  }

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add funds to your wallet via JazzCash. Balance: Rs {formatNumber(user?.balance || 0)}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Make a Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            {step === "form" ? (
              <form onSubmit={(e) => { e.preventDefault(); setStep("instructions"); }} className="space-y-5">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-400">JazzCash</p>
                      <p className="text-xs text-slate-400">Only payment method</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Deposit Amount (Rs)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5"
                    min={100}
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

                <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) < 100}>
                  Continue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3">Send Payment to JazzCash</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Name</span>
                      <span className="text-white font-medium">Muhammad Salman</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">JazzCash Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">03043310635</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("03043310635");
                            toast("success", "Copied!");
                          }}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="text-white font-semibold">Rs {parseFloat(amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-400 space-y-2">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Send exactly Rs {parseFloat(amount).toLocaleString()} to the JazzCash number above
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use your username as reference: {user?.username}
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload the payment screenshot below
                  </p>
                </div>

                <div>
                  <Label>Upload Payment Proof (Screenshot)</Label>
                  <div className="mt-1.5">
                    <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {proofFile ? (
                          <p className="text-xs text-emerald-400">{proofFile.name}</p>
                        ) : (
                          <>
                            <p className="text-xs text-slate-400">Click to upload screenshot</p>
                            <p className="text-xs text-slate-500">PNG, JPG or WEBP</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep("form")}>
                    Back
                  </Button>
                  <Button className="flex-1" isLoading={isSubmitting} onClick={handleSubmit}>
                    Submit Deposit
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deposit Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {(user?.transactions || []).filter((t: any) => t.type === "deposit").length > 0 ? (
              <div className="space-y-2">
                {(user?.transactions || [])
                  .filter((t: any) => t.type === "deposit")
                  .slice(0, 5)
                  .map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <div>
                        <p className="text-sm font-medium text-slate-200">Rs {formatNumber(tx.amount)}</p>
                        <p className="text-xs text-slate-500">{tx.description || tx.method}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        tx.status === "completed" || tx.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : tx.status === "pending"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {tx.status === "approved" ? "completed" : tx.status}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">No deposit requests yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
