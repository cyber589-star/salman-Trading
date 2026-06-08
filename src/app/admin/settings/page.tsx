"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSetting } from "@/lib/admin-service";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { getSettings().then(setSettings); }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateSetting(key, value);
      toast("success", `${key} updated`);
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch {
      toast("error", "Failed to update");
    }
    setSaving(null);
  };

  const fields = [
    { key: "admin_whatsapp", label: "Admin WhatsApp Number (with country code, no +)" },
    { key: "contact_number", label: "Contact Number" },
    { key: "jazzcash_number", label: "JazzCash Number" },
    { key: "account_name", label: "Account Name" },
    { key: "min_withdrawal", label: "Minimum Withdrawal (PKR)" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <Card>
        <CardHeader><CardTitle>App Settings</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <div className="flex gap-3 mt-1.5">
                <Input
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave(field.key, settings[field.key] || "")}
                  isLoading={saving === field.key}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Daily Earnings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">Manually trigger daily earnings for all active investments.</p>
          <Button
            onClick={async () => {
              try {
                const res = await fetch("/api/earnings", {
                  headers: { Authorization: "Bearer salman-trading-cron-2024" },
                });
                const data = await res.json();
                if (res.ok) toast("success", `Earnings processed: ${data.processed} investments`);
                else toast("error", data.error || "Failed");
              } catch { toast("error", "Request failed"); }
            }}
          >
            Run Daily Earnings Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
