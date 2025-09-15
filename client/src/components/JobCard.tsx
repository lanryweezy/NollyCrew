import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Bookmark,
  Share2,
  AlertCircle
} from "lucide-react";

export interface JobCardProps {
  id: string;
  title: string;
  type: "casting" | "crew" | "project";
  company: string;
  companyLogo?: string;
  location: string;
  budget: string;
  duration: string;
  deadline: string;
  description: string;
  requirements: string[];
  applicants: number;
  isUrgent?: boolean;
  isBookmarked?: boolean;
  onApply?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export default function JobCard({
  id,
  title,
  type,
  company,
  companyLogo,
  location,
  budget,
  duration,
  deadline,
  description,
  requirements,
  applicants,
  isUrgent = false,
  isBookmarked = false,
  onApply = () => console.log(`Apply to ${title}`),
  onBookmark = () => console.log(`Bookmark ${title}`),
  onShare = () => console.log(`Share ${title}`)
}: JobCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const typeColors = {
    casting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  const truncatedDescription = description.length > 120 
    ? `${description.substring(0, 120)}...` 
    : description;

  return (
    <Card className="w-full hover-elevate transition-all duration-200" data-testid={`card-job-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={companyLogo} alt={company} />
              <AvatarFallback>
                {company.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${typeColors[type]}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-1" data-testid={`text-title-${id}`}>
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground" data-testid={`text-company-${id}`}>
                {company}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBookmark}
            className={isBookmarked ? "text-yellow-500" : ""}
            data-testid={`button-bookmark-${id}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span data-testid={`text-location-${id}`}>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span data-testid={`text-budget-${id}`}>{budget}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span data-testid={`text-duration-${id}`}>{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span data-testid={`text-deadline-${id}`}>{deadline}</span>
          </div>
        </div>

        {/* Description */}
        <div className="text-sm">
          <p className={showFullDescription ? '' : 'line-clamp-3'}>
            {showFullDescription ? description : truncatedDescription}
          </p>
          {description.length > 120 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-primary hover:text-primary/80 mt-1"
              onClick={() => setShowFullDescription(!showFullDescription)}
              data-testid={`button-expand-${id}`}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Requirements */}
        <div className="flex flex-wrap gap-1">
          {requirements.slice(0, 3).map((req, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs"
              data-testid={`badge-requirement-${id}-${index}`}
            >
              {req}
            </Badge>
          ))}
          {requirements.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{requirements.length - 3} more
            </Badge>
          )}
        </div>

        {/* Applicants */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span data-testid={`text-applicants-${id}`}>
            {applicants} applicant{applicants !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button 
          className="flex-1"
          onClick={onApply}
          data-testid={`button-apply-${id}`}
        >
          Apply Now
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onShare}
          data-testid={`button-share-${id}`}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}