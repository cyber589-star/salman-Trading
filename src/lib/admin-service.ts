import { getSupabase } from "./supabase";
import type { Profile } from "./database.types";

export async function getAllCustomers(): Promise<Profile[]> {
  const sb = await getSupabase();
  const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function getAllDeposits() {
  const sb = await getSupabase();
  const { data } = await sb.from("deposits").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function approveDeposit(depositId: string, userId: string, amount: number) {
  const sb = await getSupabase();
  const { error: depositError } = await sb.from("deposits").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", depositId);
  if (depositError) throw depositError;

  const { data: profile } = await sb.from("profiles").select("balance").eq("id", userId).single();
  const { error: balanceError } = await sb.from("profiles").update({ balance: (profile?.balance || 0) + amount }).eq("id", userId);
  if (balanceError) throw balanceError;

  await sb.from("transactions").insert({ user_id: userId, type: "deposit", amount, status: "completed", description: "Deposit approved" });
}

export async function rejectDeposit(depositId: string) {
  const sb = await getSupabase();
  const { error } = await sb.from("deposits").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", depositId);
  if (error) throw error;
}

export async function getAllWithdrawals() {
  const sb = await getSupabase();
  const { data } = await sb.from("withdrawals").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function approveWithdrawal(withdrawalId: string, userId: string, amount: number) {
  const sb = await getSupabase();
  const { data: profile } = await sb.from("profiles").select("balance").eq("id", userId).single();
  if (!profile || profile.balance < amount) throw new Error("Insufficient balance");

  await sb.from("profiles").update({ balance: (profile?.balance || 0) - amount }).eq("id", userId);
  await sb.from("withdrawals").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", withdrawalId);
  await sb.from("transactions").insert({ user_id: userId, type: "withdrawal", amount, status: "completed", description: "Withdrawal approved" });
}

export async function rejectWithdrawal(withdrawalId: string) {
  const sb = await getSupabase();
  const { error } = await sb.from("withdrawals").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", withdrawalId);
  if (error) throw error;
}

export async function updateSetting(key: string, value: string) {
  const sb = await getSupabase();
  const { error } = await sb.from("settings").upsert({ key, value });
  if (error) throw error;
}

export async function getSettings(): Promise<Record<string, string>> {
  const sb = await getSupabase();
  const { data } = await sb.from("settings").select("*");
  const settings: Record<string, string> = {};
  (data || []).forEach((s: { key: string; value: string }) => { settings[s.key] = s.value; });
  return settings;
}
