import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, pbkdf2Sync, randomUUID } from "crypto";

export const runtime = "nodejs";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYxOTIsImV4cCI6MjA5NjMxMjE5Mn0.t0L1GirwOxA17qURwCpTRwWc3oxRUqJ3RX-aRaTp74k";

function hashPassword(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return salt + ":" + hash;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  return pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex") === hash;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, username, password } = body;

    if (action === "register") {
      if (!email || !username || !password)
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      const sb = createClient(supabaseUrl, anonKey);
      const { data: existing } = await sb.from("profiles").select("id").eq("username", username).maybeSingle();
      if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

      const id = randomUUID();
      const pwHash = hashPassword(password);

      const { error: insertErr } = await sb.from("profiles").insert({
        id, username, mobile: "", password_hash: pwHash,
        balance: 0, total_invested: 0, total_earnings: 0, role: "user",
      });
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

      return NextResponse.json({ userId: id, username });
    }

    if (action === "login") {
      if (!username || !password)
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      const sb = createClient(supabaseUrl, anonKey);
      const { data: profile } = await sb.from("profiles").select("*").eq("username", username).single();
      if (!profile) return NextResponse.json({ error: "User not found" }, { status: 401 });
      if (!profile.password_hash) return NextResponse.json({ error: "No password set" }, { status: 401 });

      if (!verifyPassword(password, profile.password_hash))
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      return NextResponse.json({ userId: profile.id, username: profile.username });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
