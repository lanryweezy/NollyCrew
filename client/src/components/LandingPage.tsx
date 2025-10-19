import { useState } from "react";
import { useLocation } from "wouter";
import Hero from "./Hero";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import ProfileCard from "./ProfileCard";
import JobCard from "./JobCard";
import ProjectCard from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Film, 
  Users, 
  Briefcase, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Quote,
  Play
} from "lucide-react";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveGrid from "@/components/ResponsiveGrid";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"actors" | "crew" | "producers">("actors");

  // Mock data for featured sections
  const featuredProfiles = {
    actors: [
      {
        id: "1",
        name: "Funke Akindele",
        role: "actor" as const,
        location: "Lagos, Nigeria",
        specialties: ["Comedy", "Drama", "Lead Roles"],
        rating: 4.8,
        reviewCount: 127,
        experience: "15+ years",
        recentProject: "Battle on Buka Street",
        isVerified: true,
        isFollowing: false
      }
    ],
    crew: [
      {
        id: "2", 
        name: "Tunde Cinematography",
        role: "crew" as const,
        location: "Abuja, Nigeria",
        specialties: ["Cinematographer", "Director of Photography", "Drone Pilot"],
        rating: 4.6,
        reviewCount: 89,
        experience: "8 years",
        recentProject: "The Set Up 2",
        isVerified: true,
        isFollowing: false
      }
    ],
    producers: [
      {
        id: "3",
        name: "Kemi Adebayo", 
        role: "producer" as const,
        location: "Port Harcourt, Nigeria",
        specialties: ["Executive Producer", "Line Producer", "Post-Production"],
        rating: 4.9,
        reviewCount: 203,
        experience: "12 years",
        recentProject: "Citation",
        isVerified: true,
        isFollowing: false
      }
    ]
  };

  const featuredJobs = [
    {
      id: "1",
      title: "Lead Actor - Romantic Drama",
      type: "casting" as const,
      company: "Trino Studios",
      location: "Lagos, Nigeria",
      budget: "₦2M - ₦5M",
      duration: "6 weeks",
      deadline: "Apply by Dec 30",
      description: "We are seeking a talented lead actor for our upcoming romantic drama series.",
      requirements: ["5+ years experience", "Age 25-35", "Lagos based"],
      applicants: 45,
      isUrgent: true,
      isBookmarked: false
    }
  ];

  const featuredProjects = [
    {
      id: "1",
      title: "Love in Lagos",
      genre: "Romantic Drama",
      status: "production" as const,
      progress: 65,
      budget: "₦50M",
      director: "Kemi Adetiba",
      startDate: "Nov 2024",
      deadline: "Mar 2025",
      teamSize: 45,
      description: "A heartwarming story about finding love in the bustling city of Lagos.",
      isOwner: false
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Connect & Collaborate",
      description: "Build your network with verified actors, crew members, and producers across Nigeria and beyond."
    },
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Our intelligent system matches the right talent with the right projects using advanced AI algorithms."
    },
    {
      icon: Briefcase,
      title: "Complete Project Management",
      description: "From script breakdown to final delivery, manage every aspect of your film production in one place."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Built-in escrow system ensures safe and timely payments for all project participants."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with international distributors and expand your reach beyond the local market."
    },
    {
      icon: Film,
      title: "Industry Tools",
      description: "Access professional tools for casting, scheduling, budgeting, and post-production workflows."
    }
  ];

  const testimonials = [
    {
      name: "Kemi Adetiba",
      role: "Director & Producer",
      company: "KAP Motion Pictures",
      quote: "NollyCrew has revolutionized how I find and collaborate with talented professionals. The AI-powered matching is incredibly accurate.",
      rating: 5
    },
    {
      name: "Richard Mofe-Damijo",
      role: "Actor",
      company: "Nollywood Veteran",
      quote: "As someone who's been in the industry for decades, I can say NollyCrew is exactly what Nollywood needed to modernize and scale.",
      rating: 5
    },
    {
      name: "Jade Osiberu",
      role: "Producer",
      company: "Greoh Studios",
      quote: "The project management tools have streamlined our entire production process. We completed our last film 30% faster.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation isAuthenticated={false} />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Demo Button Section */}
      <ResponsiveSection 
        padding="small" 
        background="muted"
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ResponsiveButton
            size="lg"
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-700"
            onClick={() => setLocation('/dashboard')}
            icon={<Play className="w-4 h-4 sm:w-5 sm:h-5" />}
            iconPosition="left"
          >
            Demo Application
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </ResponsiveButton>
          <p className="text-sm sm:text-base text-muted-foreground">
            Click to experience NollyCrewHub without login
          </p>
        </div>
      </ResponsiveSection>

      {/* Features Section */}
      <ResponsiveSection 
        padding="large" 
        background="muted"
      >
        <div className="text-center mb-12 sm:mb-16">
          <ResponsiveTypography variant="h2" align="center">
            Everything You Need for
            <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
              {" "}Film Production
            </span>
          </ResponsiveTypography>
          <ResponsiveTypography variant="p" className="text-muted-foreground max-w-3xl mx-auto mt-4">
            From pre-production to distribution, NollyCrew provides all the tools and connections you need to bring your creative vision to life.
          </ResponsiveTypography>
        </div>

        <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-elevate transition-all duration-300 h-full" data-testid={`feature-${index}`}>
              <CardHeader>
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </ResponsiveSection>

      {/* Featured Talent & Projects */}
      <ResponsiveSection padding="large">
        <div className="text-center mb-12 sm:mb-16">
          <ResponsiveTypography variant="h2" align="center">
            Discover Amazing Talent & Projects
          </ResponsiveTypography>
          <ResponsiveTypography variant="p" className="text-muted-foreground mt-4">
            Connect with verified professionals and exciting opportunities in Nollywood
          </ResponsiveTypography>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex rounded-lg border p-1 bg-muted flex-wrap">
            {[
              { id: "actors", label: "Featured Actors", icon: Users },
              { id: "crew", label: "Top Crew", icon: Film },
              { id: "producers", label: "Leading Producers", icon: Briefcase }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setSelectedTab(tab.id as any)}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          {/* Featured Profiles */}
          {featuredProfiles[selectedTab].map((profile) => (
            <ProfileCard key={profile.id} {...profile} />
          ))}

          {/* Featured Job */}
          <JobCard {...featuredJobs[0]} />

          {/* Featured Project */}
          <ProjectCard {...featuredProjects[0]} />
        </ResponsiveGrid>

        <div className="text-center mt-8 sm:mt-12">
          <ResponsiveButton
            size="lg"
            data-testid="button-explore-more"
            icon={<ArrowRight className="w-4 h-4 ml-2" />}
            iconPosition="right"
          >
            Explore More
          </ResponsiveButton>
        </div>
      </ResponsiveSection>

      {/* Testimonials */}
      <ResponsiveSection 
        padding="large" 
        background="muted"
      >
        <div className="text-center mb-12 sm:mb-16">
          <ResponsiveTypography variant="h2" align="center">
            What Industry Leaders Say
          </ResponsiveTypography>
          <ResponsiveTypography variant="p" className="text-muted-foreground mt-4">
            Trusted by Nigeria's top filmmakers and creative professionals
          </ResponsiveTypography>
        </div>

        <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300 h-full" data-testid={`testimonial-${index}`}>
              <CardHeader>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </ResponsiveSection>

      {/* CTA Section */}
      <ResponsiveSection padding="large">
        <div className="max-w-4xl mx-auto text-center">
          <ResponsiveTypography variant="h2" align="center">
            Ready to Transform Your 
            <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
              {" "}Film Career?
            </span>
          </ResponsiveTypography>
          <ResponsiveTypography variant="p" className="text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto mt-4">
            Join thousands of Nollywood professionals already using NollyCrew to find opportunities, 
            collaborate on projects, and grow their careers.
          </ResponsiveTypography>

          <ResponsiveGrid cols={{ xs: 1, sm: 3 }} className="mb-8 sm:mb-12">
            {[
              { step: "1", title: "Create Profile", desc: "Showcase your skills and experience" },
              { step: "2", title: "Get Matched", desc: "AI finds the perfect opportunities for you" },
              { step: "3", title: "Start Creating", desc: "Collaborate on amazing film projects" }
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center" data-testid={`step-${step.step}`}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                  {step.step}
                </div>
                <ResponsiveTypography variant="h5" align="center" className="mb-1 sm:mb-2">
                  {step.title}
                </ResponsiveTypography>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">{step.desc}</p>
              </div>
            ))}
          </ResponsiveGrid>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <ResponsiveButton
              size="lg"
              className="px-6 py-3 sm:px-8 sm:py-4"
              data-testid="button-start-free"
              icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
              iconPosition="right"
            >
              Start Free Today
            </ResponsiveButton>
            <ResponsiveButton
              variant="outline"
              size="lg"
              className="px-6 py-3 sm:px-8 sm:py-4"
              data-testid="button-book-demo"
            >
              Book a Demo
            </ResponsiveButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              Free to get started
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </ResponsiveSection>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span className="text-lg sm:text-xl font-bold font-serif">NollyCrew</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
                The all-in-one platform connecting actors, crew, and producers in Nigeria's 
                thriving film industry. From script to screen, we make filmmaking collaboration seamless.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">Made in Nigeria</Badge>
                <Badge variant="secondary" className="text-xs">For Nollywood</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Find Jobs</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Find Talent</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Projects</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Community</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Help Center</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Contact Us</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Terms of Service</div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              © 2024 NollyCrew. All rights reserved.
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Proudly powering the future of Nollywood
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}