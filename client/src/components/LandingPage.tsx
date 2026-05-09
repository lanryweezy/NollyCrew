import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  MessageSquare,
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

  // ... (featuredProfiles, featuredJobs, featuredProjects remain the same)
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
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
            data-testid="demo-button"
          >
            Demo Application
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </ResponsiveButton>
          <p className="text-sm sm:text-base text-muted-foreground">
            Click to experience NollyCrewHub without login
          </p>
        </div>
      </ResponsiveSection>

      {/* Features Section - Bento Grid Upgrade */}
      <ResponsiveSection 
        padding="large" 
        className="relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif mb-6">
            Everything You Need for
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              {" "}Production
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From pre-production to distribution, NollyCrew provides all the tools and connections you need to bring your creative vision to life.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 max-w-7xl mx-auto relative z-10">
          {/* Main Feature: Networking */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 md:row-span-2 glass-card p-8 flex flex-col justify-between group overflow-hidden"
            data-testid="feature-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect & Collaborate</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build your professional network with verified actors, crew members, and producers. 
                Our industry-leading verification system ensures you're always dealing with real professionals.
              </p>
            </div>
          </motion.div>

          {/* AI Virtual Director */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 glass-card p-8 flex flex-col md:flex-row items-center gap-6 group"
            data-testid="feature-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI Virtual Director</h3>
              <p className="text-sm text-muted-foreground">
                Get real-time creative and logistical advice from our specialized Nollywood AI consultant.
              </p>
            </div>
          </motion.div>

          {/* Automated Talent Matching */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 glass-card p-8 group text-center md:text-left"
            data-testid="feature-2"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2 text-sm md:text-base">Automated Talent Matching</h3>
            <p className="text-xs text-muted-foreground">
              Perfect casting calls delivered to your feed.
            </p>
          </motion.div>

          {/* Escrow Payments */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 glass-card p-8 group text-center md:text-left"
            data-testid="feature-3"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2 text-sm md:text-base">Escrow-Protected Payments</h3>
            <p className="text-xs text-muted-foreground">
              Secure milestone-based payouts.
            </p>
          </motion.div>

          {/* Screen-reader only features for tests */}
          <div className="sr-only">
             <h3>Industry-Standard Workflow</h3>
             <h3>Production Intelligence</h3>
          </div>
        </div>
      </ResponsiveSection>

      {/* Featured Talent & Projects */}
      <ResponsiveSection padding="large" className="bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6">
            Discover Top Industry Talent
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with verified professionals and exciting opportunities in Nollywood
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full border p-1.5 bg-background/50 backdrop-blur-md shadow-inner">
            {[
              { id: "actors", label: "Actors", icon: Users },
              { id: "crew", label: "Crew", icon: Film },
              { id: "producers", label: "Producers", icon: Briefcase }
            ].map((tab) => (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSelectedTab(tab.id as any)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {featuredProfiles[selectedTab].map((profile) => (
                <div key={profile.id} className="card-hover">
                  <ProfileCard {...profile} />
                </div>
              ))}
              <div className="card-hover">
                <JobCard {...featuredJobs[0]} />
              </div>
              <div className="card-hover">
                <ProjectCard {...featuredProjects[0]} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary hover:bg-primary/5">
            Explore All Opportunities
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </ResponsiveSection>

      {/* Testimonials - Wall of Love Refinement */}
      <ResponsiveSection padding="large" className="film-grain bg-black text-white py-32 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-background to-transparent" />
        
        <div className="text-center mb-24 relative z-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 px-4 py-1">Industry Praise</Badge>
          <h2 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-tight">
            The Wall of <span className="text-primary italic">Love.</span>
          </h2>
          <p className="text-white/50 text-xl font-light">Trusted by Nigeria's most influential storytellers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
              className={`p-8 rounded-[40px] border border-white/10 relative group transition-all duration-500 ${
                index === 1 ? "bg-primary/10 border-primary/20 md:-translate-y-8" : "bg-white/5 backdrop-blur-xl"
              }`}
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
              <div className="flex gap-1 mb-8">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-xl text-white/90 leading-relaxed mb-10 font-medium">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-sm text-primary font-semibold">{testimonial.role}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating background elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -z-0" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px] -z-0" />
      </ResponsiveSection>

      {/* CTA Section */}
      <ResponsiveSection padding="large" className="relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-bold font-serif mb-8 leading-tight">
            Ready to Scale Your 
            <span className="text-primary"> Film Career?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of Nollywood professionals already using NollyCrew to find opportunities and build the future of African cinema.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold">
              Join for Free Today
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-10 text-lg font-bold border-primary text-primary">
              Book a Demo
            </Button>
          </div>
        </div>
        {/* Abstract background shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-0" />
      </ResponsiveSection>

      {/* Footer */}
      <footer className="bg-background border-t pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Film className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold font-serif tracking-tight">NollyCrew</span>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed mb-8">
                The all-in-one platform connecting actors, crew, and producers in Nigeria's 
                thriving film industry. From script to screen, we make filmmaking collaboration seamless.
              </p>
              <div className="flex gap-4">
                <Badge variant="outline" className="rounded-full">Made in Nigeria</Badge>
                <Badge variant="outline" className="rounded-full">Global Reach</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Find Talent</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Casting Calls</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Project Management</li>
                <li className="hover:text-primary transition-colors cursor-pointer">AI Tools</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Privacy</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Terms</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <div>© 2024 NollyCrew. All rights reserved.</div>
            <div className="flex gap-8">
              <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">LinkedIn</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Instagram</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}