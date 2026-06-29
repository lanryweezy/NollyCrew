import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Send, Loader2, Video, Phone, Wifi } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_MESSAGES = [
  { id: "m1", user: "Kunle Afolayan", message: "Script review meeting tomorrow at 3pm", time: "10:30 AM" },
  { id: "m2", user: "Kemi Adetiba", message: "Great work on the casting! Let's finalize the schedule.", time: "9:15 AM" },
  { id: "m3", user: "Don Omope", message: "Budget approved. We're greenlit!", time: "Yesterday" },
];

const ONLINE_USERS = [
  { name: "Kunle A.", status: "online" },
  { name: "Kemi A.", status: "online" },
  { name: "Don O.", status: "away" },
  { name: "Blessing E.", status: "offline" },
];

export default function Collaboration() {
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(DEMO_MESSAGES);

  function handleSend() {
    if (!message.trim()) return;
    setMessages([...messages, {
      id: `m${Date.now()}`,
      user: profile?.first_name || "You",
      message: message.trim(),
      time: "Now"
    }]);
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Collaboration" description="Real-time project collaboration" />

        <div className="grid md:grid-cols-4 gap-6">
          {/* Online Users */}
          <Card className="md:col-span-1">
            <CardHeader><CardTitle className="text-sm">Team Members</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {ONLINE_USERS.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${u.status === "online" ? "bg-green-500" : u.status === "away" ? "bg-yellow-500" : "bg-gray-300"}`} />
                  <span className="text-sm">{u.name}</span>
                </div>
              ))}
              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "Video call feature coming soon" })}><Video className="w-3 h-3 mr-1" /> Call</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "Voice call feature coming soon" })}><Phone className="w-3 h-3 mr-1" /> Voice</Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Project Chat
                <Badge variant="secondary" className="ml-auto"><Wifi className="w-3 h-3 mr-1" /> Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{msg.user[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{msg.user} <span className="text-xs text-muted-foreground ml-2">{msg.time}</span></p>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()} />
                <Button size="icon" onClick={handleSend}><Send className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
