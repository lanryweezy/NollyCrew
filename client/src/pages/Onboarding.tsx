import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Film, 
  Users, 
  Briefcase, 
  Camera,
  Mic,
  Edit,
  Settings,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

const roleOptions = [
  {
    id: "actor",
    title: "Actor",
    description: "Perform in films, TV shows, and commercials",
    icon: Film,
    color: "bg-blue-500",
    features: [
      "Browse casting calls",
      "Upload showreels and headshots", 
      "Connect with directors",
      "Build your portfolio"
    ],
    popular: true
  },
  {
    id: "crew",
    title: "Crew Member",
    description: "Work behind the scenes in production",
    icon: Camera,
    color: "bg-green-500",
    features: [
      "Find crew opportunities",
      "Showcase technical skills",
      "Join production teams",
      "Build industry network"
    ],
    popular: false
  },
  {
    id: "producer",
    title: "Producer/Director",
    description: "Create and manage film projects",
    icon: Briefcase,
    color: "bg-purple-500",
    features: [
      "Post casting calls",
      "Manage production teams",
      "Track project progress",
      "Find distribution partners"
    ],
    popular: true
  },
  {
    id: "writer",
    title: "Writer",
    description: "Create scripts and storylines",
    icon: Edit,
    color: "bg-orange-500",
    features: [
      "Share your scripts",
      "Collaborate with producers",
      "Get feedback on work",
      "Find writing opportunities"
    ],
    popular: false
  },
  {
    id: "technical",
    title: "Technical Specialist",
    description: "Provide specialized technical services",
    icon: Settings,
    color: "bg-red-500",
    features: [
      "Offer technical services",
      "Equipment rental listings",
      "Post-production services",
      "Technical consulting"
    ],
    popular: false
  }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { addRole } = useAuth();
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Please select at least one role",
        description: "Choose the roles that best describe your involvement in the film industry.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add each selected role
      for (const roleId of selectedRoles) {
        await addRole({
          role: roleId as any,
          experience: "entry", // Default experience level
          specialties: [], // Will be filled in profile setup
          isActive: true
        });
      }

      toast({
        title: "Welcome to NollyCrew!",
        description: "Your roles have been set up. Let's complete your profile.",
      });

      setLocation("/profile");
    } catch (error) {
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "An error occurred during setup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Film className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to NollyCrew!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's set up your professional profile. Choose at least one role to unlock the app features.
          </p>
          <div className="mt-3 text-sm text-amber-700 bg-amber-100 inline-block px-3 py-1 rounded">
            Tip: You can always add or change roles later in your profile.
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRoles.includes(role.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleToggle(role.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mb-3`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  {role.popular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{role.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {selectedRoles.includes(role.id) && (
                  <div className="mt-4 p-2 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Selected
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedRoles.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Selected Roles ({selectedRoles.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map((roleId) => {
                  const role = roleOptions.find(r => r.id === roleId);
                  const IconComponent = role?.icon;
                  return (
                    <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                      {IconComponent && <IconComponent className="w-3 h-3" />}
                      {role?.title}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleContinue}
            disabled={selectedRoles.length === 0 || isLoading}
            size="lg"
            className="px-8"
          >
            {isLoading ? "Setting up..." : "Continue to Profile"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            size="lg"
            className="px-8"
          >
            Skip for Now
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Don't worry, you can always add or change your roles later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
