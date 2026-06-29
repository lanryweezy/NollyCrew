import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { profiles, userRoles } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { AvatarUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Edit, Save, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { ProfileSkeleton } from "@/components/PageSkeletons";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { profile, roles, isAuthenticated, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        phone: profile.phone || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await profiles.update(profile.id, formData);
      await refreshProfile();
    } catch {
      // ignore
    }
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Profile"
          description="Manage your public profile"
          actions={
            editing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )
          }
        />

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <AvatarUpload
                currentAvatar={profile?.avatar}
                onUpload={(url) => { if (profile) { refreshProfile(); } }}
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                {profile?.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </p>
                )}
              </div>
            </div>

            {/* Roles */}
            {roles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.role}
                  </Badge>
                ))}
              </div>
            )}

            {/* Edit Form or Display */}
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Lagos, Nigeria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}
                {profile?.website && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
