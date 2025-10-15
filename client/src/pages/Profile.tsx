import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Star,
  Award,
  Briefcase,
  Film,
  Users,
  Settings,
  Upload
} from "lucide-react";
import { api } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PortfolioGallery from "@/components/PortfolioGallery";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, roles, addRole } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    website: user?.website || "",
    avatar: user?.avatar || ""
  });

  // Mock portfolio data
  const mockPortfolio = [
    {
      id: "1",
      title: "Battle on Buka Street",
      role: "Lead Actor",
      year: "2022",
      type: "feature",
      image: "/api/placeholder/300/200",
      description: "Award-winning comedy-drama about family relationships"
    },
    {
      id: "2", 
      title: "The Set Up 2",
      role: "Supporting Actor",
      year: "2023",
      type: "feature",
      image: "/api/placeholder/300/200",
      description: "Action thriller sequel with international appeal"
    }
  ];

  const mockSkills = [
    "Acting", "Drama", "Comedy", "Voice Acting", "Improvisation", "Stage Performance"
  ];

  const mockAwards = [
    {
      id: "1",
      title: "Best Actress - AMVCA 2023",
      organization: "Africa Magic Viewers Choice Awards",
      year: "2023",
      description: "Outstanding performance in Battle on Buka Street"
    },
    {
      id: "2",
      title: "Rising Star Award",
      organization: "Nollywood Film Festival",
      year: "2022", 
      description: "Recognition for breakthrough performance"
    }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Mock save operation
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
      website: user?.website || "",
      avatar: user?.avatar || ""
    });
    setIsEditing(false);
  };

  const handleAddRole = async () => {
    try {
      await addRole({
        role: "actor",
        experience: "mid",
        specialties: ["Drama", "Comedy"]
      });
      toast({
        title: "Role added!",
        description: "New role has been added to your profile.",
      });
    } catch (error) {
      toast({
        title: "Failed to add role",
        description: "There was an error adding the role.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        if (!user?.id) return;
        const { reviews } = await api.listUserReviews(user.id);
        setReviews(reviews);
      } catch (e) {
        console.error(e);
      }
    };
    loadReviews();
  }, [user?.id]);

  const submitReview = async () => {
    try {
      if (!user?.id) return;
      const { review } = await api.createUserReview(user.id, { rating: newRating, comment: newComment });
      setReviews(prev => [review, ...prev]);
      setNewRating(5);
      setNewComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole={roles[0]?.role || "actor"}
          userName={`${user?.firstName} ${user?.lastName}`}
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader 
          title="Profile"
          subtitle="Manage your professional profile and showcase your work"
        />
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={formData.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2"
                      onClick={() => {/* Handle avatar upload */}}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    {(roles || []).map(role => role.role).join(", ")}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-muted-foreground">(127 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(roles || []).map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.role}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddRole}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Role
                  </Button>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Lagos, Nigeria"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills & Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skill
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Portfolio Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioGallery 
                  items={mockPortfolio.map(item => ({
                    id: item.id,
                    type: "image",
                    title: item.title,
                    url: item.image,
                    description: item.description
                  })).slice(0, 3)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioGallery 
                  items={mockPortfolio.map(item => ({
                    id: item.id,
                    type: "image",
                    title: item.title,
                    url: item.image,
                    description: item.description
                  }))}
                />
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Portfolio Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Awards & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAwards.map((award) => (
                  <div key={award.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Award className="w-6 h-6 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{award.title}</h3>
                      <p className="text-sm text-muted-foreground">{award.organization} • {award.year}</p>
                      <p className="text-sm mt-1">{award.description}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Award
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <Button variant="outline">Update Password</Button>
                </div>
                <div className="space-y-2">
                  <Label>Privacy Settings</Label>
                  <Button variant="outline">Manage Privacy</Button>
                </div>
                <div className="space-y-2">
                  <Label>Notification Preferences</Label>
                  <Button variant="outline">Configure Notifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reviews */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Input type="number" min={1} max={5} value={newRating} onChange={e => setNewRating(Number(e.target.value))} className="w-24" />
              <Textarea placeholder="Leave a comment (optional)" value={newComment} onChange={e => setNewComment(e.target.value)} />
              <Button onClick={submitReview}>Submit</Button>
            </div>
            <div className="space-y-3">
              {(reviews || []).map((r) => (
                <div key={r.id} className="border rounded p-3">
                  <div className="font-medium">Rating: {r.rating}/5</div>
                  {r.comment && <div className="text-sm text-muted-foreground mt-1">{r.comment}</div>}
                </div>
              ))}
              {(!reviews || reviews.length === 0) && (
                <div className="text-sm text-muted-foreground">No reviews yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
