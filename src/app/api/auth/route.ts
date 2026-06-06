import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYxOTIsImV4cCI6MjA5NjMxMjE5Mn0.t0L1GirwOxA17qURwCpTRwWc3oxRUqJ3RX-aRaTp74k";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg2MzgxNiwiZXhwIjoyMDU3NDM5ODE2fQ.31mS5C-ZqH0Lc3UGq9l5s_XXWRP18cAHPEq0gCY6H5s";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Check username not taken
    const anon = createClient(supabaseUrl, anonKey);
    const { data: existing } = await anon.from("profiles").select("id").eq("username", username).maybeSingle();
    if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

    // 2. Create confirmed auth user via Admin REST API
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { username } }),
    });
    const created = await res.json();
    if (!res.ok) return NextResponse.json({ error: created.msg || "Auth creation failed" }, { status: 500 });

    // 3. Insert profile
    await anon.from("profiles").insert({
      id: created.id, username, mobile: "", balance: 0, total_invested: 0, total_earnings: 0, role: "user",
    });

    // 4. Sign in to get session
    const auth = createClient(supabaseUrl, anonKey);
    const { data: sessionData, error: signInErr } = await auth.auth.signInWithPassword({ email, password });
    if (signInErr) return NextResponse.json({ error: "Created but sign-in failed: " + signInErr.message }, { status: 500 });

    return NextResponse.json({
      access_token: sessionData.session!.access_token,
      refresh_token: sessionData.session!.refresh_token,
      userId: created.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
