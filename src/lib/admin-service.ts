import { getSupabase } from "./supabase";
import type { Profile } from "./database.types";

function toNum(v: any): number {
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

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
  const currentBalance = toNum(profile?.balance);
  const { error: balanceError } = await sb.from("profiles").update({ balance: currentBalance + toNum(amount) }).eq("id", userId);
  if (balanceError) throw balanceError;

  await sb.from("transactions").update({ status: "completed", description: "Deposit approved" }).eq("user_id", userId).eq("type", "deposit").eq("amount", amount).eq("status", "pending");
}

export async function rejectDeposit(depositId: string) {
  const sb = await getSupabase();
  const { data: deposit } = await sb.from("deposits").select("user_id, amount").eq("id", depositId).single();
  if (!deposit) throw new Error("Deposit not found");
  const { error } = await sb.from("deposits").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", depositId);
  if (error) throw error;
  await sb.from("transactions").update({ status: "rejected", description: "Deposit rejected" }).eq("user_id", deposit.user_id).eq("type", "deposit").eq("amount", deposit.amount).eq("status", "pending");
}

export async function deleteDeposit(depositId: string) {
  const sb = await getSupabase();
  await sb.from("deposits").delete().eq("id", depositId);
}

export async function deleteCustomer(customerId: string) {
  const sb = await getSupabase();
  await sb.from("profiles").delete().eq("id", customerId);
  await sb.from("deposits").delete().eq("user_id", customerId);
  await sb.from("investments").delete().eq("user_id", customerId);
  await sb.from("transactions").delete().eq("user_id", customerId);
  await sb.from("withdrawals").delete().eq("user_id", customerId);
}

export async function getAllWithdrawals() {
  const sb = await getSupabase();
  const { data } = await sb.from("withdrawals").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function approveWithdrawal(withdrawalId: string, userId: string, amount: number) {
  const sb = await getSupabase();
  const { data: profile } = await sb.from("profiles").select("balance").eq("id", userId).single();
  const currentBalance = toNum(profile?.balance);
  if (currentBalance < amount) throw new Error("Insufficient balance");

  await sb.from("profiles").update({ balance: currentBalance - amount }).eq("id", userId);
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
