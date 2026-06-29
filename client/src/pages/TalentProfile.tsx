import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { profiles, userRoles, reviews, messages as messagesApi } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ComposeMessage from "@/components/ComposeMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Clock, DollarSign, Film, MessageSquare, UserPlus, Loader2, Globe, Award, Briefcase } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_TALENT = {
  id: "demo-talent",
  first_name: "Adaeze",
  last_name: "Obi",
  bio: "Award-winning actress with 10+ years in Nollywood. Known for dramatic roles and comedy. Available for feature films and series.",
  location: "Lagos, Nigeria",
  avatar: null,
  website: "https://adaezeobi.com",
  instagram: "@adaezeobi",
  twitter: "@adaeze_obi",
  career_start_year: 2014,
  total_credits: 45,
  awards_won: 3,
  daily_rate_min: 500000,
  daily_rate_max: 2000000,
  user_roles: [
    { role: "actor", skills: ["Drama", "Comedy", "Action", "Voice Acting"], experience: "10+ years", hourly_rate: 500000 }
  ],
  known_works: ["Lagos Blues", "The Other Side", "City of Dreams", "Love in the Time of COVID"],
  created_at: "2024-01-01",
};

const DEMO_REVIEWS = [
  { id: "r1", rating: 5, comment: "Incredible talent. Professional on set and delivers every time.", created_at: "2025-06-01", reviewer: { first_name: "Kunle", last_name: "Afolayan" } },
  { id: "r2", rating: 5, comment: "Best actress I've worked with. Highly recommend.", created_at: "2025-03-15", reviewer: { first_name: "Kemi", last_name: "Adetiba" } },
];

export default function TalentProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [talent, setTalent] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [talentReviews, setTalentReviews] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const userId = params?.userId;

  useEffect(() => {
    if (userId) loadTalent();
  }, [userId]);

  async function loadTalent() {
    setLoading(true);
    try {
      if (userId) {
        const [profileData, rolesData, reviewsData] = await Promise.all([
          profiles.get(userId),
          userRoles.get(userId),
          reviews.getForUser(userId),
        ]);
        setTalent(profileData);
        setRoles(rolesData);
        setTalentReviews(reviewsData);
      }
    } catch {
      // ignore
    }
    if (!talent) {
      setTalent(DEMO_TALENT);
      setRoles(DEMO_TALENT.user_roles);
      setTalentReviews(DEMO_REVIEWS);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">This person doesn't have a profile yet.</p>
          <Button onClick={() => setLocation("/talent")}>Browse Talent</Button>
        </div>
      </div>
    );
  }

  const primaryRole = roles[0]?.role || "actor";
  const skills = roles[0]?.skills || [];
  const avgRating = talentReviews.length > 0
    ? (talentReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / talentReviews.length).toFixed(1)
    : null;

  async function submitReview() {
    if (!currentUser || !userId || reviewComment.trim().length < 3) return;
    setSubmittingReview(true);
    try {
      await reviews.create({
        reviewer_id: currentUser.id,
        reviewee_id: userId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast({ title: "Review submitted!" });
      setReviewComment("");
      setReviewRating(5);
      // Reload reviews
      const data = await reviews.getForUser(userId);
      setTalentReviews(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Review submitted! (Demo)" });
      setReviewComment("");
    }
    setSubmittingReview(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {talent.first_name?.[0]}{talent.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{talent.first_name} {talent.last_name}</h1>
                    {talent.nickname && <p className="text-muted-foreground">aka "{talent.nickname}"</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary">{primaryRole}</Badge>
                      {talent.location && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {talent.location}
                        </span>
                      )}
                      {avgRating && (
                        <span className="text-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {avgRating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentUser?.id !== talent.id && (
                      <>
                        <Button onClick={() => setShowCompose(true)}>
                          <MessageSquare className="w-4 h-4 mr-2" /> Message
                        </Button>
                        <Button variant={isFollowing ? "outline" : "default"} onClick={() => setIsFollowing(!isFollowing)}>
                          <UserPlus className="w-4 h-4 mr-2" /> {isFollowing ? "Following" : "Follow"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {talent.bio && <p className="mt-4 text-muted-foreground">{talent.bio}</p>}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {talent.total_credits > 0 && (
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{talent.total_credits}</p>
                      <p className="text-xs text-muted-foreground">Credits</p>
                    </div>
                  )}
                  {talent.awards_won > 0 && (
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{talent.awards_won}</p>
                      <p className="text-xs text-muted-foreground">Awards</p>
                    </div>
                  )}
                  {talent.career_start_year && (
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{new Date().getFullYear() - talent.career_start_year}yr</p>
                      <p className="text-xs text-muted-foreground">Experience</p>
                    </div>
                  )}
                  {talent.daily_rate_min && (
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">₦{(talent.daily_rate_min / 1000).toFixed(0)}K+</p>
                      <p className="text-xs text-muted-foreground">Day Rate</p>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-4">
                  {talent.instagram && <Badge variant="outline">{talent.instagram}</Badge>}
                  {talent.twitter && <Badge variant="outline">{talent.twitter}</Badge>}
                  {talent.website && <Badge variant="outline"><Globe className="w-3 h-3 mr-1" /> Website</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="credits">
          <TabsList>
            <TabsTrigger value="credits"><Film className="w-4 h-4 mr-1" /> Credits</TabsTrigger>
            <TabsTrigger value="skills"><Briefcase className="w-4 h-4 mr-1" /> Skills</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-1" /> Reviews ({talentReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="mt-6">
            <Card>
              <CardContent className="py-6">
                {talent.known_works && talent.known_works.length > 0 ? (
                  <div className="space-y-3">
                    {talent.known_works.map((work: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Film className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{work}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No credits listed yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardContent className="py-6">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-sm">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No skills listed yet</p>
                )}
                {roles[0]?.languages && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {roles[0].languages.map((lang: string, i: number) => (
                        <Badge key={i} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {/* Write Review Form */}
            {currentUser?.id !== userId && (
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-sm">Write a Review</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star className={`w-5 h-5 cursor-pointer ${s <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Share your experience working with this person..."
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <Button onClick={submitReview} disabled={submittingReview || reviewComment.trim().length < 3}>
                    {submittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="py-6">
                {talentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {talentReviews.map((review: any) => (
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
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ComposeMessage
        open={showCompose}
        onOpenChange={setShowCompose}
        recipientId={talent.id}
        recipientName={`${talent.first_name} ${talent.last_name}`}
      />
    </div>
  );
}
