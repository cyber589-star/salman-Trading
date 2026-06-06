"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllDeposits, approveDeposit, rejectDeposit } from "@/lib/admin-service";

export default function AdminPaymentsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    const data = await getAllDeposits();
    setDeposits(data);
  };

  useEffect(() => { load(); }, []);

  const filtered = deposits.filter((d) => filter === "all" ? true : d.status === filter);

  const handleApprove = async (id: string, userId: string, amount: number) => {
    await approveDeposit(id, userId, amount);
    await load();
  };

  const handleReject = async (id: string) => {
    await rejectDeposit(id);
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
      <h1 className="text-2xl font-bold text-white">Payment Approvals</h1>

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
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Proof</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 text-white font-medium">{d.username}</td>
                    <td className="p-4 text-emerald-400">Rs {Number(d.amount).toLocaleString()}</td>
                    <td className="p-4 text-slate-300 capitalize">{d.method}</td>
                    <td className="p-4">
                      {d.proof_url ? (
                        <a href={d.proof_url} target="_blank" rel="noopener noreferrer"
                          className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all">
                          <img src={d.proof_url} alt="Payment proof" className="w-full h-full object-cover" />
                        </a>
                      ) : <span className="text-slate-500">No proof</span>}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        d.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                        d.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {d.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(d.id, d.user_id, d.amount)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleReject(d.id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">No deposits found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
