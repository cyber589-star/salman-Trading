"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCustomers, deleteCustomer } from "@/lib/admin-service";
import type { Profile } from "@/lib/database.types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => setCustomers(await getAllCustomers());
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer and all their data?")) return;
    await deleteCustomer(id);
    await load();
  };

  const filtered = customers.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Customers</h1>
      <input
        type="text"
        placeholder="Search by username or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="p-4 font-medium">Username</th>
                  <th className="p-4 font-medium">Mobile</th>
                  <th className="p-4 font-medium">Balance</th>
                  <th className="p-4 font-medium">Total Invested</th>
                  <th className="p-4 font-medium">Total Earnings</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 text-white font-medium">{c.username}</td>
                    <td className="p-4 text-slate-300">{c.mobile}</td>
                    <td className="p-4 text-emerald-400">Rs {Number(c.balance).toLocaleString()}</td>
                    <td className="p-4 text-blue-400">Rs {Number(c.total_invested).toLocaleString()}</td>
                    <td className="p-4 text-amber-400">Rs {Number(c.total_earnings).toLocaleString()}</td>
                    <td className="p-4 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
