let client: any = null;

export async function getSupabase() {
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(
      "https://akucxvmgngceoqtbwxhn.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWN4dm1nbmdjZW9xdGJ3eGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYxOTIsImV4cCI6MjA5NjMxMjE5Mn0.t0L1GirwOxA17qURwCpTRwWc3oxRUqJ3RX-aRaTp74k"
    );
  }
  return client;
}
