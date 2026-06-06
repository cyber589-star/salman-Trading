import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNjE5MiwiZXhwIjoyMDk2MzEyMTkyfQ.ZXS-o5kCaC-EXnn1D0bNn7Od4Xcp4mQW7ledBllvo9o";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "admin_password")
      .single();

    if (data && data.value === password) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
