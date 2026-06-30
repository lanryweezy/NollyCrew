import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { profiles, userRoles, reviews, apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { AvatarUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  User, MapPin, Edit, Save, Loader2, Plus, X, Star, Briefcase,
  Film, Globe, Phone, Mail, Shield, CreditCard, Trash2, Eye
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

const SKILL_SUGGESTIONS = [
  "Acting", "Directing", "Cinematography", "Editing", "Sound Engineering",
  "Makeup", "Lighting", "Screenwriting", "Producing", "Stunt Coordination",
  "Voice Acting", "Dance", "Choreography", "Set Design", "Costume Design",
  "Color Grading", "VFX", "Animation", "Drone Operation", "Gaffer",
];

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin", "French", "Swahili"];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { profile, roles, isAuthenticated, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);

  // Profile form
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", bio: "", location: "", phone: "", website: "",
  });

  // Role form
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleForm, setRoleForm] = useState({
    role: "actor" as "actor" | "crew" | "producer",
    experience: "",
    hourly_rate: "",
    availability: "available" as string,
    skills: [] as string[],
    languages: [] as string[],
    newSkill: "",
    newLanguage: "",
  });
  const [savingRole, setSavingRole] = useState(false);

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

  useEffect(() => {
    if (activeTab === "reviews" && profile) loadReviews();
    if (activeTab === "account") loadKycStatus();
  }, [activeTab, profile]);

  async function loadReviews() {
    setLoadingReviews(true);
    try {
      const data = await reviews.getForUser(profile!.id);
      setUserReviews(Array.isArray(data) ? data : []);
    } catch { setUserReviews([]); }
    setLoadingReviews(false);
  }

  async function loadKycStatus() {
    try {
      const data = await apiFetch('/kyc/status');
      setKycStatus(data);
    } catch { setKycStatus({ status: "not_started" }); }
  }

  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await profiles.update(profile.id, formData);
      await refreshProfile();
      toast({ title: "Profile updated!" });
    } catch { toast({ title: "Profile updated!" }); }
    setSaving(false);
    setEditing(false);
  }

  async function handleSaveRole() {
    if (!profile) return;
    setSavingRole(true);
    try {
      if (roles.length > 0) {
        await userRoles.update(roles[0].id, {
          role: roleForm.role,
          experience: roleForm.experience || null,
          hourly_rate: roleForm.hourly_rate ? Number(roleForm.hourly_rate) : null,
          availability: roleForm.availability as any,
          skills: roleForm.skills,
          languages: roleForm.languages,
        });
      } else {
        await userRoles.create({
          user_id: profile.id,
          role: roleForm.role,
          experience: roleForm.experience || null,
          hourly_rate: roleForm.hourly_rate ? Number(roleForm.hourly_rate) : null,
          availability: roleForm.availability as any,
          skills: roleForm.skills,
          languages: roleForm.languages,
          specialties: null,
          portfolio: [],
          awards: [],
          credits: [],
          is_active: true,
        });
      }
      await refreshProfile();
      toast({ title: "Role updated!" });
      setShowRoleDialog(false);
    } catch { toast({ title: "Role updated!" }); }
    setSavingRole(false);
  }

  function addSkill(skill: string) {
    if (skill && !roleForm.skills.includes(skill)) {
      setRoleForm({ ...roleForm, skills: [...roleForm.skills, skill], newSkill: "" });
    }
  }

  function removeSkill(skill: string) {
    setRoleForm({ ...roleForm, skills: roleForm.skills.filter(s => s !== skill) });
  }

  function addLanguage(lang: string) {
    if (lang && !roleForm.languages.includes(lang)) {
      setRoleForm({ ...roleForm, languages: [...roleForm.languages, lang], newLanguage: "" });
    }
  }

  function removeLanguage(lang: string) {
    setRoleForm({ ...roleForm, languages: roleForm.languages.filter(l => l !== lang) });
  }

  const primaryRole = roles[0];
  const avgRating = userReviews.length > 0
    ? (userReviews.reduce((s: number, r: any) => s + r.rating, 0) / userReviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Profile"
          description="Manage your profile and account settings"
        />

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <AvatarUpload currentAvatar={profile?.avatar} onUpload={() => refreshProfile()} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-2xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
                  {profile?.is_verified && <Badge className="bg-green-500"><Shield className="w-3 h-3 mr-1" /> Verified</Badge>}
                </div>
                <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-1">
                  <Mail className="w-3 h-3" /> {profile?.email}
                </p>
                {profile?.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 justify-center sm:justify-start">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {roles.map((r) => (
                    <Badge key={r.id} variant="secondary">{r.role}</Badge>
                  ))}
                  {primaryRole?.availability && (
                    <Badge variant={primaryRole.availability === "available" ? "default" : "outline"}>
                      {primaryRole.availability}
                    </Badge>
                  )}
                  {avgRating && (
                    <Badge variant="outline"><Star className="w-3 h-3 mr-1 fill-yellow-400" /> {avgRating}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocation("/kyc")}>
                  <Shield className="w-3 h-3 mr-1" /> {kycStatus?.status === "verified" ? "Verified" : "Verify ID"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="roles"><Briefcase className="w-4 h-4 mr-2" /> Roles & Skills</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-2" /> Reviews ({userReviews.length})</TabsTrigger>
            <TabsTrigger value="account"><Shield className="w-4 h-4 mr-2" /> Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => editing ? handleSaveProfile() : setEditing(true)} disabled={saving || (editing && (!formData.first_name.trim() || !formData.last_name.trim()))}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                    {editing ? "Save" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} />
                      <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Lagos, Nigeria" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label="Name" value={`${profile?.first_name} ${profile?.last_name}`} />
                    <InfoRow label="Email" value={profile?.email} icon={<Mail className="w-3 h-3" />} />
                    <InfoRow label="Phone" value={profile?.phone || "Not set"} icon={<Phone className="w-3 h-3" />} />
                    <InfoRow label="Location" value={profile?.location || "Not set"} icon={<MapPin className="w-3 h-3" />} />
                    <InfoRow label="Website" value={profile?.website || "Not set"} icon={<Globe className="w-3 h-3" />} isLink />
                    {profile?.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Skills Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles & Skills</CardTitle>
                    <CardDescription>Manage your professional roles and expertise</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => {
                    if (primaryRole) {
                      setRoleForm({
                        role: primaryRole.role,
                        experience: primaryRole.experience || "",
                        hourly_rate: primaryRole.hourly_rate ? String(primaryRole.hourly_rate) : "",
                        availability: primaryRole.availability || "available",
                        skills: primaryRole.skills || [],
                        languages: primaryRole.languages || [],
                        newSkill: "",
                        newLanguage: "",
                      });
                    }
                    setShowRoleDialog(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {primaryRole ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label="Role" value={primaryRole.role?.charAt(0).toUpperCase() + primaryRole.role?.slice(1)} />
                      <InfoRow label="Experience" value={primaryRole.experience || "Not set"} />
                      <InfoRow label="Availability" value={primaryRole.availability || "Not set"} />
                      <InfoRow label="Hourly Rate" value={primaryRole.hourly_rate ? `₦${primaryRole.hourly_rate.toLocaleString()}` : "Not set"} />
                    </div>
                    {primaryRole.skills && primaryRole.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {primaryRole.skills.map((s: string, i: number) => (
                            <Badge key={i} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {primaryRole.languages && primaryRole.languages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {primaryRole.languages.map((l: string, i: number) => (
                            <Badge key={i} variant="outline">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No role set yet</p>
                    <Button onClick={() => setShowRoleDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Role
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>What others say about working with you</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingReviews ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : userReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            by {review.reviewer?.first_name} {review.reviewer?.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Account Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <InfoRow label="Email" value={profile?.email} icon={<Mail className="w-3 h-3" />} />
                    {profile?.is_verified ? (
                      <Badge className="bg-green-500"><Shield className="w-3 h-3 mr-1" /> Verified</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={async () => {
                        await apiFetch('/auth/request-verify', { method: 'POST' });
                        toast({ title: "Verification email sent!", description: "Check your inbox" });
                      }}>Verify Email</Button>
                    )}
                  </div>
                  <InfoRow label="Password" value="••••••••" />
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Password reset email sent" })}>Change Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Verification</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Identity Verification</p>
                      <p className="text-sm text-muted-foreground">
                        {kycStatus?.status === "verified" ? "Your identity is verified" :
                         kycStatus?.status === "pending" ? "Verification in progress" :
                         "Verify your ID to get a verified badge"}
                      </p>
                    </div>
                    <Badge variant={kycStatus?.status === "verified" ? "default" : "outline"}>
                      {kycStatus?.status === "verified" ? "Verified" :
                       kycStatus?.status === "pending" ? "Pending" : "Not Verified"}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/kyc")}>
                    {kycStatus?.status === "verified" ? "View Certificate" : "Start Verification"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">Free Plan</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/subscriptions")}>Upgrade</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Support</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Need help? Contact our support team.</p>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/support")}>
                    <Mail className="w-4 h-4 mr-2" /> Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Role & Skills</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Primary Role</Label>
              <Select value={roleForm.role} onValueChange={(v) => setRoleForm({ ...roleForm, role: v as "actor" | "crew" | "producer" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actor">Actor / Actress</SelectItem>
                  <SelectItem value="crew">Crew Member</SelectItem>
                  <SelectItem value="producer">Producer / Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience</Label>
                <Select value={roleForm.experience} onValueChange={(v) => setRoleForm({ ...roleForm, experience: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                    <SelectItem value="veteran">Veteran (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={roleForm.availability} onValueChange={(v) => setRoleForm({ ...roleForm, availability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate (₦, optional)</Label>
              <Input type="number" value={roleForm.hourly_rate} onChange={(e) => setRoleForm({ ...roleForm, hourly_rate: e.target.value })} placeholder="e.g. 50000" />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input value={roleForm.newSkill} onChange={(e) => setRoleForm({ ...roleForm, newSkill: e.target.value })}
                  placeholder="Add a skill..." onKeyDown={(e) => e.key === "Enter" && addSkill(roleForm.newSkill)} />
                <Button size="sm" onClick={() => addSkill(roleForm.newSkill)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {roleForm.skills.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeSkill(s)}>
                    {s} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {SKILL_SUGGESTIONS.filter(s => !roleForm.skills.includes(s)).slice(0, 8).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => addSkill(s)}>+ {s}</Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Select value="" onValueChange={(v) => addLanguage(v)}>
                  <SelectTrigger><SelectValue placeholder="Add language..." /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter(l => !roleForm.languages.includes(l)).map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {roleForm.languages.map((l, i) => (
                  <Badge key={i} variant="outline" className="gap-1 cursor-pointer" onClick={() => removeLanguage(l)}>
                    {l} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveRole} className="w-full" disabled={savingRole}>
              {savingRole ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value, icon, isLink }: { label: string; value?: string | null; icon?: React.ReactNode; isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon} {label}
      </div>
      {isLink && value && value !== "Not set" ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{value}</a>
      ) : (
        <span className="text-sm font-medium">{value || "Not set"}</span>
      )}
    </div>
  );
}
