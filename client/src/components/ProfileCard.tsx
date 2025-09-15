import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, MessageCircle, UserPlus, Eye } from "lucide-react";

export interface ProfileCardProps {
  id: string;
  name: string;
  role: "actor" | "crew" | "producer";
  avatar?: string;
  location: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  experience: string;
  recentProject?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  onMessage?: () => void;
  onFollow?: () => void;
  onViewProfile?: () => void;
}

export default function ProfileCard({
  id,
  name,
  role,
  avatar,
  location,
  specialties,
  rating,
  reviewCount,
  experience,
  recentProject,
  isVerified = false,
  isFollowing = false,
  onMessage = () => console.log(`Message ${name}`),
  onFollow = () => console.log(`Follow ${name}`),
  onViewProfile = () => console.log(`View ${name}'s profile`)
}: ProfileCardProps) {
  const roleColors = {
    actor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  return (
    <Card className="w-full max-w-sm hover-elevate transition-all duration-200" data-testid={`card-profile-${id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate" data-testid={`text-name-${id}`}>
                {name}
              </h3>
              {isVerified && (
                <Badge variant="secondary" className="text-xs">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <Badge className={`text-xs ${roleColors[role]}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span data-testid={`text-location-${id}`}>{location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium" data-testid={`text-rating-${id}`}>
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-muted-foreground text-sm">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1">
          {specialties.slice(0, 3).map((specialty, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs"
              data-testid={`badge-specialty-${id}-${index}`}
            >
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{specialties.length - 3} more
            </Badge>
          )}
        </div>

        {/* Experience */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Experience:</span> {experience}
        </div>

        {/* Recent Project */}
        {recentProject && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Latest:</span> {recentProject}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button 
          size="sm" 
          className="flex-1"
          onClick={onMessage}
          data-testid={`button-message-${id}`}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button 
          variant={isFollowing ? "secondary" : "outline"}
          size="sm"
          onClick={onFollow}
          data-testid={`button-follow-${id}`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isFollowing ? "Following" : "Follow"}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onViewProfile}
          data-testid={`button-view-${id}`}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}