"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCustomers, getAllDeposits, getAllWithdrawals } from "@/lib/admin-service";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, deposits: 0, withdrawals: 0, totalBalance: 0 });

  useEffect(() => {
    const load = async () => {
      const [customers, deposits, withdrawals] = await Promise.all([
        getAllCustomers(),
        getAllDeposits(),
        getAllWithdrawals(),
      ]);
      setStats({
        customers: customers.length,
        deposits: deposits.filter((d: any) => d.status === "pending").length,
        withdrawals: withdrawals.filter((w: any) => w.status === "pending").length,
        totalBalance: customers.reduce((sum: number, c: any) => sum + Number(c.balance), 0),
      });
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-400">Total Customers</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.customers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-400">Pending Deposits</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.deposits}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-400">Pending Withdrawals</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.withdrawals}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-400">Total Customer Balance</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">Rs {stats.totalBalance.toLocaleString()}</p>
        </CardContent></Card>
      </div>
    </div>
  );
}
