"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCustomers } from "@/lib/admin-service";
import type { Profile } from "@/lib/database.types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { getAllCustomers().then(setCustomers); }, []);

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
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
