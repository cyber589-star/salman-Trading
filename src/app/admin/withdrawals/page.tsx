"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/lib/admin-service";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    const data = await getAllWithdrawals();
    setWithdrawals(data);
  };

  useEffect(() => { load(); }, []);

  const filtered = withdrawals.filter((w) => filter === "all" ? true : w.status === filter);

  const handleApprove = async (id: string, userId: string, amount: number) => {
    try {
      await approveWithdrawal(id, userId, amount);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReject = async (id: string) => {
    await rejectWithdrawal(id);
    await load();
  };

  const filters = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="p-4 font-medium">Username</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Account</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 text-white font-medium">{w.username}</td>
                    <td className="p-4 text-red-400">Rs {Number(w.amount).toLocaleString()}</td>
                    <td className="p-4 text-slate-300">{w.account_number}</td>
                    <td className="p-4 text-slate-300">{w.account_name}</td>
                    <td className="p-4 text-slate-400">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        w.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                        w.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(w.id, w.user_id, w.amount)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleReject(w.id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">No withdrawals found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
