import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Play, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export interface ProjectCardProps {
  id: string;
  title: string;
  genre: string;
  status: "pre-production" | "production" | "post-production" | "completed";
  progress: number;
  budget: string;
  director: string;
  directorAvatar?: string;
  startDate: string;
  deadline: string;
  teamSize: number;
  poster?: string;
  description: string;
  isOwner?: boolean;
  onViewProject?: () => void;
  onManage?: () => void;
}

export default function ProjectCard({
  id,
  title,
  genre,
  status,
  progress,
  budget,
  director,
  directorAvatar,
  startDate,
  deadline,
  teamSize,
  poster,
  description,
  isOwner = false,
  onViewProject = () => console.log(`View project ${title}`),
  onManage = () => console.log(`Manage project ${title}`)
}: ProjectCardProps) {
  const statusColors = {
    "pre-production": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "production": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "post-production": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  };

  const statusIcons = {
    "pre-production": Clock,
    "production": Play,
    "post-production": AlertTriangle,
    "completed": CheckCircle
  };

  const StatusIcon = statusIcons[status];

  return (
    <Card className="w-full hover-elevate transition-all duration-200" data-testid={`card-project-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {poster ? (
              <img 
                src={poster} 
                alt={title}
                className="w-16 h-20 object-cover rounded-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge className={`text-xs ${statusColors[status]}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {genre}
                </Badge>
              </div>
              <CardTitle className="text-lg" data-testid={`text-title-${id}`}>
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={directorAvatar} alt={director} />
                  <AvatarFallback className="text-xs">
                    {director.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground" data-testid={`text-director-${id}`}>
                  {director}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" data-testid={`button-options-${id}`}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground" data-testid={`text-progress-${id}`}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span data-testid={`text-budget-${id}`}>{budget}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span data-testid={`text-team-${id}`}>{teamSize} members</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span data-testid={`text-start-${id}`}>{startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span data-testid={`text-deadline-${id}`}>{deadline}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant="outline"
          className="flex-1"
          onClick={onViewProject}
          data-testid={`button-view-${id}`}
        >
          View Details
        </Button>
        {isOwner && (
          <Button 
            className="flex-1"
            onClick={onManage}
            data-testid={`button-manage-${id}`}
          >
            Manage Project
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}