"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate as formatDateUtil, formatNumber } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const sb = await getSupabase();
    await sb.from("profiles").update({ mobile }).eq("id", user?.id);
    await refreshUser();
    toast("success", "Profile updated!");
    setIsSaving(false);
  }

  const investments = (user as any)?.investments || [];
  const memberSince = user?.created_at ? formatDateUtil(user.created_at) : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <Label htmlFor="p-username">Username</Label>
                  <Input id="p-username" value={user?.username || ""} disabled className="mt-1.5 bg-slate-800/50" />
                  <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="p-mobile">Mobile Number</Label>
                  <Input id="p-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-1.5" />
                </div>

                <div>
                  <Label htmlFor="p-joined">Member Since</Label>
                  <Input id="p-joined" value={memberSince} disabled className="mt-1.5 bg-slate-800/50" />
                </div>

                <Button type="submit" isLoading={isSaving}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">256-bit SSL Encryption</p>
                    <p className="text-xs text-slate-400">Your data is fully encrypted</p>
                  </div>
                </div>
                <Badge variant="active">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Balance</span>
                <span className="text-sm font-semibold text-emerald-400">Rs {formatNumber(user?.balance || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Invested</span>
                <span className="text-sm font-semibold text-blue-400">Rs {formatNumber(user?.total_invested || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Earnings</span>
                <span className="text-sm font-semibold text-amber-400">Rs {formatNumber(user?.total_earnings || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Active Plans</span>
                <span className="text-sm font-semibold text-purple-400">
                  {investments.filter((i: any) => i.status === "active").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
