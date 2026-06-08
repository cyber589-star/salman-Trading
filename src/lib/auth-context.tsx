"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSupabase } from "./supabase";
import type { Profile } from "./database.types";
import { INVESTMENT_PACKAGES } from "./data";

interface UserProfile extends Profile {
  investments?: any[];
  transactions?: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number, method: string, proofFile?: File) => Promise<string | true>;
  invest: (packageId: number) => Promise<boolean>;
  withdraw: (amount: number, accountNumber: string, accountName: string) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => void;
  refreshUser: () => Promise<void>;
}

function toNum(v: any): number {
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string): Promise<boolean> => {
    const sb = await getSupabase();
    const { data: profile, error: pfErr } = await sb.from("profiles").select("*").eq("id", userId).single();
    if (pfErr || !profile) return false;
    const [invRes, txRes] = await Promise.all([
      sb.from("investments").select("*").eq("user_id", userId).order("started_at", { ascending: false }),
      sb.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    ]);
    setUser({ ...profile, investments: invRes.data || [], transactions: txRes.data || [] } as UserProfile);
    return true;
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("st_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.id) {
          fetchProfile(parsed.id).then((p) => {
            if (!p) { localStorage.removeItem("st_user"); setUser(null); }
          });
        }
        setUser(parsed);
      } catch {}
    }
    setIsLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    if (user) localStorage.setItem("st_user", JSON.stringify(user));
    else localStorage.removeItem("st_user");
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setIsLoading(false); return { success: false, error: data.error || "Login failed" }; }

      await fetchProfile(data.userId);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) { setIsLoading(false); return { success: false, error: err?.message }; }
  }, [fetchProfile]);

  const register = useCallback(async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setIsLoading(false); return { success: false, error: data.error || "Registration failed" }; }

      await fetchProfile(data.userId);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) { setIsLoading(false); return { success: false, error: err?.message }; }
  }, [fetchProfile]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("st_user");
  }, []);

  const refreshUser = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  const deposit = useCallback(async (amount: number, method: string, proofFile?: File): Promise<string | true> => {
    if (!user) return "Not logged in";
    const sb = await getSupabase();
    let proofUrl = "";
    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const { data: up, error: upErr } = await sb.storage.from("payment-proofs").upload(`${user.id}/${Date.now()}.${ext}`, proofFile);
      if (upErr) return "Upload failed: " + upErr.message;
      if (up) proofUrl = sb.storage.from("payment-proofs").getPublicUrl(up.path).data.publicUrl;
    }
    const { error } = await sb.from("deposits").insert({
      user_id: user.id, amount, method, proof_url: proofUrl, status: "pending", username: user.username,
    });
    if (error) return "Deposit insert failed: " + error.message;

    const { error: txErr } = await sb.from("transactions").insert({
      user_id: user.id, type: "deposit", amount, status: "pending", method,
      description: "Deposit pending approval",
    });
    if (txErr) return "Transaction insert failed: " + txErr.message;

    await refreshUser();
    return true;
  }, [user, refreshUser]);

  const invest = useCallback(async (packageId: number): Promise<boolean> => {
    if (!user) return false;
    const pkg = INVESTMENT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg || user.balance < pkg.investment) return false;
    const sb = await getSupabase();

    await sb.from("profiles").update({
      balance: user.balance - pkg.investment, total_invested: user.total_invested + pkg.investment,
    }).eq("id", user.id);

    await sb.from("investments").insert({
      user_id: user.id, package_id: pkg.id, package_name: pkg.name, amount: pkg.investment,
      daily_profit: pkg.dailyProfit, total_profit: pkg.totalProfit, duration: pkg.duration,
      days_completed: 0, status: "active",
    });

    await sb.from("transactions").insert({
      user_id: user.id, type: "investment", amount: pkg.investment, status: "completed",
      description: `Investment in ${pkg.name} plan`,
    });

    // Add first day earning immediately
    const { data: currentProfile } = await sb.from("profiles").select("balance, total_earnings").eq("id", user.id).single();
    if (currentProfile) {
      const earning = toNum(pkg.dailyProfit);
      await sb.from("profiles").update({
        balance: toNum(currentProfile.balance) + earning,
        total_earnings: toNum(currentProfile.total_earnings) + earning,
      }).eq("id", user.id);
      await sb.from("transactions").insert({
        user_id: user.id, type: "earning", amount: earning, status: "completed",
        description: `Daily profit from ${pkg.name}`,
      });
    }

    await refreshUser();
    return true;
  }, [user, refreshUser]);

  const withdraw = useCallback(async (amount: number, accountNumber: string, accountName: string): Promise<boolean> => {
    if (!user) return false;
    const sb = await getSupabase();
    const { data: settings } = await sb.from("settings").select("*");
    const sm: Record<string, string> = {};
    (settings || []).forEach((s: any) => { sm[s.key] = s.value; });
    const minW = parseFloat(sm.min_withdrawal || "60");
    if (amount < minW || user.balance < amount) return false;

    const { data: active } = await sb.from("investments").select("id").eq("user_id", user.id).eq("status", "active").limit(1);
    if (!active?.length) return false;

    await sb.from("withdrawals").insert({
      user_id: user.id, amount, account_number: accountNumber, account_name: accountName,
      method: "jazzcash", status: "pending", username: user.username,
    });
    await sb.from("profiles").update({ balance: user.balance - amount }).eq("id", user.id);
    await sb.from("transactions").insert({
      user_id: user.id, type: "withdrawal", amount, status: "pending",
      description: `Withdrawal to ${accountName} (${accountNumber})`,
    });
    await refreshUser();
    return true;
  }, [user, refreshUser]);

  const updateProfile = useCallback((data: Partial<Profile>) => {
    if (!user) return;
    getSupabase().then(sb => sb.from("profiles").update(data).eq("id", user.id)).then(() => refreshUser());
  }, [user, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, deposit, invest, withdraw, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
