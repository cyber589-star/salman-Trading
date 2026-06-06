import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg2MzgxNiwiZXhwIjoyMDU3NDM5ODE2fQ.31mS5C-ZqH0Lc3UGq9l5s_XXWRP18cAHPEq0gCY6H5s";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await sb.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
