import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Users, 
  Briefcase, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Play
} from "lucide-react";

const heroImage = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop";

const avatars = [
  "https://i.pravatar.cc/150?u=1",
  "https://i.pravatar.cc/150?u=2",
  "https://i.pravatar.cc/150?u=3",
  "https://i.pravatar.cc/150?u=4",
  "https://i.pravatar.cc/150?u=5",
];

export default function Hero() {
  const [selectedRole, setSelectedRole] = useState<"actor" | "crew" | "producer">("actor");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const rolePreviews = {
    actor: {
      title: "Audition Feed",
      items: ["Lead Role - Netflix Original", "Commercial - Global Brand", "Short Film - Lagos Fest"],
      metric: "98% Match"
    },
    crew: {
      title: "Active Gigs",
      items: ["DOP - Action Series", "Sound Mixer - Indie Film", "Editor - Music Video"],
      metric: "₦2.5M Earned"
    },
    producer: {
      title: "Production Pipeline",
      items: ["Love in Lagos (Pre-prod)", "The Set Up (Filming)", "Chief Daddy (Post)"],
      metric: "45 Crew Hired"
    }
  };

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden film-grain">
      {/* Cinematic Background with Parallax Scale */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <img
          src={heroImage}
          alt="Nollywood film set"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
      </motion.div>

      {/* Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-20 text-center"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-4 py-1.5 text-sm font-medium">
            <Star className="w-4 h-4 mr-2 fill-primary" />
            Empowering the Nollywood Ecosystem
          </Badge>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold text-white mb-8 font-serif leading-[1.1] tracking-tight"
        >
          Lights. Camera.{" "}
          <span className="bg-gradient-to-r from-primary via-yellow-400 to-orange-500 bg-clip-text text-transparent text-glow">
            Connection.
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          The premier professional network for Africa's most vibrant film industry. 
          Connect, collaborate, and create with verified Nollywood talent.
        </motion.p>

        {/* Integrated Social Proof & Waitlist */}
        <motion.div variants={itemVariants} className="mb-12">
          <WaitlistForm />
          
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex -space-x-3">
              {avatars.map((url, i) => (
                <motion.img
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + (i * 0.1) }}
                  src={url}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  alt={`User ${i}`}
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +10k
              </div>
            </div>
            <p className="text-sm text-white/60 font-medium">
              Join <span className="text-white">10,000+</span> industry professionals already on board
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mt-20">
          {/* Role Quick Selection */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {[
              { id: "actor" as const, icon: Camera, label: "Talent", desc: "Find auditions" },
              { id: "crew" as const, icon: Users, label: "Crew", desc: "Showcase skills" },
              { id: "producer" as const, icon: Briefcase, label: "Producers", desc: "Hire top talent" }
            ].map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`glass-card p-6 cursor-pointer text-left group transition-all duration-500 ${
                  selectedRole === role.id ? "border-primary bg-primary/20 ring-1 ring-primary/50" : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${
                      selectedRole === role.id ? "bg-primary text-primary-foreground" : "bg-white/10 text-white"
                    }`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-0.5">{role.label}</h3>
                      <p className="text-sm text-white/50">{role.desc}</p>
                    </div>
                  </div>
                  {selectedRole === role.id && <CheckCircle className="w-6 h-6 text-primary animate-in zoom-in" />}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive Preview Container */}
          <motion.div variants={itemVariants} className="hidden lg:block relative h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-deep rounded-[32px] p-8 w-full border border-white/20 shadow-2xl relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20" />
                
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-2xl font-bold text-white">{rolePreviews[selectedRole].title}</h4>
                  <Badge variant="outline" className="text-primary border-primary font-bold">
                    {rolePreviews[selectedRole].metric}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {rolePreviews[selectedRole].items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-10 bg-primary/40 rounded-full" />
                        <span className="text-white font-medium">{item}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 flex items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
                   <p className="text-white/40 text-sm font-medium">Real-time matching active</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Final CTA Area */}
        <motion.div variants={itemVariants} className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            size="lg" 
            className="h-14 px-10 text-lg font-bold rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300"
          >
            Launch Experience
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <button className="flex items-center gap-3 text-white hover:text-primary transition-colors font-semibold group">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
              <Play className="w-5 h-5 fill-current" />
            </div>
            Watch Showreel
          </button>
        </motion.div>
      </motion.div>

      {/* Ambient Lighting Effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing-v2" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={onSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-background/80 backdrop-blur-md rounded-full p-1 border border-white/10">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Join the exclusive early access list..."
            className="flex-1 bg-transparent px-6 py-3 text-white placeholder:text-white/40 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 h-auto font-bold"
          >
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Processing
                </motion.div>
              ) : status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  You're in!
                </motion.div>
              ) : (
                <motion.span key="default">Secure Access</motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </form>
      {status === "error" && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-xs text-destructive mt-3 font-medium"
        >
          Something went wrong. Please try again.
        </motion.p>
      )}
    </div>
  );
}