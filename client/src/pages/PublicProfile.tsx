import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, reviews as reviewsApi, messages as messagesApi } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ComposeMessage from "@/components/ComposeMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Star, Briefcase, Film, MessageSquare, Shield, Globe, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function PublicProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  const userId = params?.userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const [profileData, rolesData, reviewsData] = await Promise.all([
        apiFetch(`/users/${userId}`),
        apiFetch(`/profile/roles`).catch(() => []),
        reviewsApi.getForUser(userId!).catch(() => []),
      ]);
      setUser(profileData.user);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUserReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch {
      // Demo fallback
      setUser({ id: userId, first_name: "User", last_name: "", email: "", bio: "This user hasn't set up their profile yet.", location: "Lagos, Nigeria", avatar: null });
    }
    setLoading(false);
  }

  const avgRating = userReviews.length > 0
    ? (userReviews.reduce((s: number, r: any) => s + r.rating, 0) / userReviews.length).toFixed(1)
    : null;

  const primaryRole = roles[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={!!currentUser} />
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={!!currentUser} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button onClick={() => setLocation("/talent")}>Browse Talent</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={!!currentUser} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                  {user.is_verified && <Badge className="bg-green-500"><Shield className="w-3 h-3 mr-1" /> Verified</Badge>}
                </div>
                {primaryRole && (
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <Badge variant="secondary">{primaryRole.role}</Badge>
                    {primaryRole.experience && <span className="text-sm text-muted-foreground">{primaryRole.experience}</span>}
                  </div>
                )}
                {user.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2 justify-center sm:justify-start">
                    <MapPin className="w-3 h-3" /> {user.location}
                  </p>
                )}
                {avgRating && (
                  <p className="text-sm flex items-center gap-1 mt-1 justify-center sm:justify-start">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {avgRating} ({userReviews.length} reviews)
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {primaryRole?.skills?.slice(0, 5).map((s: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              {currentUser && currentUser.id !== userId && (
                <Button onClick={() => setShowCompose(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {user.bio && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">About</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{user.bio}</p></CardContent>
          </Card>
        )}

        {/* Languages */}
        {primaryRole?.languages?.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">Languages</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {primaryRole.languages.map((l: string, i: number) => (
                  <Badge key={i} variant="outline">{l}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {userReviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">Reviews ({userReviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {userReviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">by {review.reviewer?.first_name} {review.reviewer?.last_name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm">{review.comment}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Website */}
        {user.website && (
          <Card>
            <CardContent className="pt-4">
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm">
                <Globe className="w-4 h-4" /> {user.website} <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>
        )}
      </main>

      <ComposeMessage open={showCompose} onOpenChange={setShowCompose} recipientId={userId} recipientName={`${user.first_name} ${user.last_name}`} />
    </div>
  );
}
