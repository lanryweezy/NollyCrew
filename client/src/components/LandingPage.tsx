import { useState } from "react";
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
  Quote
} from "lucide-react";

export default function LandingPage() {
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

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need for
              <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                {" "}Film Production
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From pre-production to distribution, NollyCrew provides all the tools and connections you need to bring your creative vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-elevate transition-all duration-300" data-testid={`feature-${index}`}>
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talent & Projects */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Discover Amazing Talent & Projects</h2>
            <p className="text-xl text-muted-foreground">
              Connect with verified professionals and exciting opportunities in Nollywood
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg border p-1 bg-muted">
              {[
                { id: "actors", label: "Featured Actors", icon: Users },
                { id: "crew", label: "Top Crew", icon: Film },
                { id: "producers", label: "Leading Producers", icon: Briefcase }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={selectedTab === tab.id ? "default" : "ghost"}
                  className="flex items-center gap-2"
                  onClick={() => setSelectedTab(tab.id as any)}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Profiles */}
            {featuredProfiles[selectedTab].map((profile) => (
              <ProfileCard key={profile.id} {...profile} />
            ))}

            {/* Featured Job */}
            <JobCard {...featuredJobs[0]} />

            {/* Featured Project */}
            <ProjectCard {...featuredProjects[0]} />
          </div>

          <div className="text-center mt-12">
            <Button size="lg" data-testid="button-explore-more">
              Explore More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Industry Leaders Say</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by Nigeria's top filmmakers and creative professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`testimonial-${index}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">
                        "{testimonial.quote}"
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your 
            <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
              {" "}Film Career?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of Nollywood professionals already using NollyCrew to find opportunities, 
            collaborate on projects, and grow their careers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { step: "1", title: "Create Profile", desc: "Showcase your skills and experience" },
              { step: "2", title: "Get Matched", desc: "AI finds the perfect opportunities for you" },
              { step: "3", title: "Start Creating", desc: "Collaborate on amazing film projects" }
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center" data-testid={`step-${step.step}`}>
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-center">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg" data-testid="button-start-free">
              Start Free Today
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg" data-testid="button-book-demo">
              Book a Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Free to get started
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Film className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold font-serif">NollyCrew</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                The all-in-one platform connecting actors, crew, and producers in Nigeria's 
                thriving film industry. From script to screen, we make filmmaking collaboration seamless.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">Made in Nigeria</Badge>
                <Badge variant="secondary">For Nollywood</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Find Jobs</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Find Talent</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Projects</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Community</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Help Center</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Contact Us</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Terms of Service</div>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 NollyCrew. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Proudly powering the future of Nollywood
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}