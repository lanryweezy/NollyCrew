import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Users, Briefcase, Star, ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/Nollywood_film_set_hero_02428654.png";

export interface HeroProps {}

export default function Hero({}: HeroProps) {
  const [selectedRole, setSelectedRole] = useState<"actor" | "crew" | "producer">("actor");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background with Dark Wash */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Nollywood film set"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2" />
            The Future of Nollywood is Here
          </Badge>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 font-serif">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            NollyCrew
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          The all-in-one platform connecting actors, crew, and producers in Nigeria's thriving film industry.
          From script to screen, we make filmmaking collaboration seamless.
        </p>

        {/* Waitlist form */}
        <WaitlistForm />

        {/* Role Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: "actor" as const, icon: Camera, label: "I'm an Actor", desc: "Find casting calls and auditions" },
            { id: "crew" as const, icon: Users, label: "I'm Crew", desc: "Showcase skills and get hired" },
            { id: "producer" as const, icon: Briefcase, label: "I'm a Producer", desc: "Manage projects and hire talent" }
          ].map((role) => (
            <Button
              key={role.id}
              variant={selectedRole === role.id ? "default" : "outline"}
              size="lg"
              className={`flex flex-col items-center gap-2 p-6 h-auto min-w-[200px] ${
                selectedRole === role.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              }`}
              onClick={() => setSelectedRole(role.id)}
              data-testid={`button-role-${role.id}`}
            >
              <role.icon className="w-8 h-8" />
              <div>
                <div className="font-semibold text-lg">{role.label}</div>
                <div className="text-sm opacity-80">{role.desc}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            data-testid="button-get-started"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: "10,000+", label: "Active Professionals" },
            { number: "500+", label: "Projects Completed" },
            { number: "50+", label: "Cities Covered" }
          ].map((stat) => (
            <div key={stat.label} className="text-white">
              <div className="text-4xl font-bold text-yellow-400" data-testid={`stat-${stat.number}`}>
                {stat.number}
              </div>
              <div className="text-lg text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "landing" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl flex flex-col sm:flex-row gap-3 mb-12">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 rounded-md border px-3 py-2"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        className="flex-1 rounded-md border px-3 py-2"
      />
      <Button
        disabled={status === "loading"}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : status === "success" ? "Joined!" : "Join waitlist"}
      </Button>
      {status === "error" && (
        <span className="text-sm text-red-500">Something went wrong. Try again.</span>
      )}
    </form>
  );
}