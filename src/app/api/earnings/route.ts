import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseUrl = "https://akucxvmgngceoqtbwxhn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNjE5MiwiZXhwIjoyMDk2MzEyMTkyfQ.ZXS-o5kCaC-EXnn1D0bNn7Od4Xcp4mQW7ledBllvo9o";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "salman-trading-cron-2024"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: investments, error } = await supabase
      .from("investments")
      .select("*")
      .eq("status", "active");

    if (error) throw error;

    const now = Date.now();
    const nowISO = new Date(now).toISOString();
    let processed = 0;

    for (const inv of investments || []) {
      if (Number(inv.days_completed) >= Number(inv.duration)) {
        await supabase.from("investments").update({ status: "completed" }).eq("id", inv.id);
        continue;
      }

      // Skip if 24 hours haven't passed since last_earning_at
      const lastEarning = new Date(inv.last_earning_at).getTime();
      if (now - lastEarning < 24 * 60 * 60 * 1000) continue;

      const earning = Number(inv.daily_profit);
      const newDays = Number(inv.days_completed) + 1;
      const newStatus = newDays >= Number(inv.duration) ? "completed" : "active";

      await supabase.from("investments").update({
        days_completed: newDays,
        last_earning_at: nowISO,
        status: newStatus,
      }).eq("id", inv.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, total_earnings")
        .eq("id", inv.user_id)
        .single();

      if (profile) {
        await supabase.from("profiles").update({
          balance: Number(profile.balance) + earning,
          total_earnings: Number(profile.total_earnings) + earning,
        }).eq("id", inv.user_id);
      }

      await supabase.from("transactions").insert({
        user_id: inv.user_id,
        type: "earning",
        amount: earning,
        status: "completed",
        description: `Daily profit from ${inv.package_name}`,
      });

      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
