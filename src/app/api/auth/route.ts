import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg2MzgxNiwiZXhwIjoyMDU3NDM5ODE2fQ.31mS5C-ZqH0Lc3UGq9l5s_XXWRP18cAHPEq0gCY6H5s";

function usernameToEmail(username: string): string {
  return "u" + Array.from(username).map((c) => c.charCodeAt(0).toString(36)).join("") + "@st.com";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, mobile, password, deviceId } = body;
    if (!action || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const email = usernameToEmail(username);

    if (action === "register") {
      const existing = await sb.from("profiles").select("id").eq("username", username).maybeSingle();
      if (existing.data) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

      if (mobile) {
        const em = await sb.from("profiles").select("id").eq("mobile", mobile).maybeSingle();
        if (em.data) return NextResponse.json({ error: "Mobile number already registered" }, { status: 400 });
      }

      if (deviceId) {
        const dc = await sb.from("profiles").select("id").eq("device_id", deviceId).maybeSingle();
        if (dc.data) return NextResponse.json({ error: "Account exists on this device" }, { status: 400 });
      }

      const { data: newUser, error: createError } = await sb.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, mobile: mobile || "" },
      });
      if (createError || !newUser.user) {
        return NextResponse.json({ error: createError?.message || "Registration failed" }, { status: 500 });
      }

      await sb.from("profiles").insert({
        id: newUser.user.id, username, mobile: mobile || "", balance: 0, total_invested: 0, total_earnings: 0, role: "user", device_id: deviceId || null,
      });

      const { data: signIn, error: signInError } = await sb.auth.signInWithPassword({ email, password });
      if (signInError || !signIn.session) {
        return NextResponse.json({ error: "Account created but login failed" }, { status: 500 });
      }

      return NextResponse.json({
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
        userId: newUser.user.id,
      });
    }

    if (action === "login") {
      const { data: profile } = await sb.from("profiles").select("id").eq("username", username).single();
      if (!profile) return NextResponse.json({ error: "Username not found" }, { status: 401 });

      const { data: signIn, error: signInError } = await sb.auth.signInWithPassword({ email, password });
      if (signInError) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      return NextResponse.json({
        access_token: signIn.session!.access_token,
        refresh_token: signIn.session!.refresh_token,
        userId: profile.id,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
