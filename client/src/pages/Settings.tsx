import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Eye, Palette, Trash2, Shield, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    jobAlerts: true,
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    theme: localStorage.getItem("nollycrew-theme") || "system",
  });

  function updateSetting(key: string, value: any) {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === "theme") {
      localStorage.setItem("nollycrew-theme", value);
      document.documentElement.classList.toggle("dark", value === "dark");
    }
    toast({ title: "Setting updated" });
  }

  async function handleDeleteAccount() {
    toast({ title: "Account deletion requested", description: "Contact support to complete deletion" });
    setShowDeleteConfirm(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/profile")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </Button>
        <PageHeader title="Settings" description="Manage your account preferences" />

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingRow label="Email Notifications" description="Receive notifications via email" checked={settings.emailNotifications} onChange={(v) => updateSetting("emailNotifications", v)} />
              <SettingRow label="Push Notifications" description="Browser push notifications" checked={settings.pushNotifications} onChange={(v) => updateSetting("pushNotifications", v)} />
              <SettingRow label="Message Notifications" description="Get notified when you receive messages" checked={settings.messageNotifications} onChange={(v) => updateSetting("messageNotifications", v)} />
              <SettingRow label="Job Alerts" description="Get notified about new jobs matching your skills" checked={settings.jobAlerts} onChange={(v) => updateSetting("jobAlerts", v)} />
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Privacy</CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm">Profile Visibility</p><p className="text-xs text-muted-foreground">Who can see your profile</p></div>
                <Select value={settings.profileVisibility} onValueChange={(v) => updateSetting("profileVisibility", v)}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SettingRow label="Show Email" description="Display email on your public profile" checked={settings.showEmail} onChange={(v) => updateSetting("showEmail", v)} />
              <SettingRow label="Show Phone" description="Display phone on your public profile" checked={settings.showPhone} onChange={(v) => updateSetting("showPhone", v)} />
              <SettingRow label="Allow Messages" description="Let other users send you messages" checked={settings.allowMessages} onChange={(v) => updateSetting("allowMessages", v)} />
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm">Theme</p><p className="text-xs text-muted-foreground">Choose your preferred theme</p></div>
                <Select value={settings.theme} onValueChange={(v) => updateSetting("theme", v)}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">Are you sure? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Yes, Delete Account</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Delete Account</p><p className="text-xs text-muted-foreground">Permanently delete your account and all data</p></div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SettingRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
