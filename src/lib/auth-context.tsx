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
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number, method: string, proofFile?: File) => Promise<boolean>;
  invest: (packageId: number) => Promise<boolean>;
  withdraw: (amount: number, accountNumber: string, accountName: string) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function usernameToEmail(username: string): string {
  return "u" + Array.from(username).map((c) => c.charCodeAt(0).toString(36)).join("") + "@st.com";
}

function generateDeviceId(): string {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
    localStorage.setItem("device_id", id);
  }
  return id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const sb = await getSupabase();
    const { data: profile } = await sb.from("profiles").select("*").eq("id", userId).single();
    if (!profile) return;
    const [invRes, txRes] = await Promise.all([
      sb.from("investments").select("*").eq("user_id", userId).order("started_at", { ascending: false }),
      sb.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    ]);
    setUser({ ...profile, investments: invRes.data || [], transactions: txRes.data || [] } as UserProfile);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("st_user");
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("st_user", JSON.stringify(user));
    else localStorage.removeItem("st_user");
  }, [user]);

  const refreshUser = useCallback(async () => {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) await fetchProfile(session.user.id);
  }, [fetchProfile]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const sb = await getSupabase();
      const { data: profile } = await sb.from("profiles").select("id").eq("username", username).single();
      if (!profile) { setIsLoading(false); return false; }

      const safeEmail = usernameToEmail(username);
      const { error } = await sb.auth.signInWithPassword({
        email: safeEmail, password,
      });
      if (error) { setIsLoading(false); return false; }

      await fetchProfile(profile.id);
      setIsLoading(false);
      return true;
    } catch { setIsLoading(false); return false; }
  }, [fetchProfile]);

  const register = useCallback(async (username: string, mobile: string, password: string) => {
    setIsLoading(true);
    try {
      const sb = await getSupabase();
      const existing = await sb.from("profiles").select("username").eq("username", username).maybeSingle();
      if (existing.data) { setIsLoading(false); return { success: false, error: "Username already taken" }; }

      const existingMobile = await sb.from("profiles").select("id").eq("mobile", mobile).maybeSingle();
      if (existingMobile.data) { setIsLoading(false); return { success: false, error: "Mobile number already registered" }; }

      const deviceId = generateDeviceId();
      const dc = await sb.from("profiles").select("id").eq("device_id", deviceId).maybeSingle();
      if (dc.data) { setIsLoading(false); return { success: false, error: "Account exists on this device" }; }

      const safeEmail = usernameToEmail(username);
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: safeEmail, password,
        options: { data: { username, mobile } },
      });
      if (authError || !authData.user) { setIsLoading(false); return { success: false, error: authError?.message || "Registration failed" }; }

      await fetch("/api/confirm-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authData.user.id }),
      });

      await sb.from("profiles").insert({
        id: authData.user.id, username, mobile, balance: 0, total_invested: 0, total_earnings: 0, role: "user", device_id: deviceId,
      });

      await fetchProfile(authData.user.id);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) { setIsLoading(false); return { success: false, error: err?.message }; }
  }, [fetchProfile]);

  const logout = useCallback(() => {
    getSupabase().then(sb => sb.auth.signOut()).catch(() => {});
    setUser(null);
    localStorage.removeItem("st_user");
  }, []);

  const deposit = useCallback(async (amount: number, method: string, proofFile?: File): Promise<boolean> => {
    if (!user) return false;
    const sb = await getSupabase();
    let proofUrl = "";
    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const { data: up } = await sb.storage.from("payment-proofs").upload(`${user.id}/${Date.now()}.${ext}`, proofFile);
      if (up) proofUrl = sb.storage.from("payment-proofs").getPublicUrl(up.path).data.publicUrl;
    }
    const { error } = await sb.from("deposits").insert({
      user_id: user.id, amount, method, proof_url: proofUrl, status: "pending", username: user.username,
    });
    if (error) return false;
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

    await refreshUser();
    return true;
  }, [user, refreshUser]);

  const withdraw = useCallback(async (amount: number, accountNumber: string, accountName: string): Promise<boolean> => {
    if (!user) return false;
    const sb = await getSupabase();
    const { data: settings } = await sb.from("settings").select("*");
    const sm: Record<string, string> = {};
    (settings || []).forEach((s: any) => { sm[s.key] = s.value; });
    const minW = parseFloat(sm.min_withdrawal || "1000");
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
