import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Wifi, WifiOff } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_MESSAGES = [
  { id: "m1", user: "Kunle Afolayan", message: "Script review meeting tomorrow at 3pm", time: "10:30 AM" },
  { id: "m2", user: "Kemi Adetiba", message: "Great work on the casting! Let's finalize the schedule.", time: "9:15 AM" },
  { id: "m3", user: "Don Omope", message: "Budget approved. We're greenlit!", time: "Yesterday" },
];

export default function Collaboration() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { connect, disconnect, sendChatMessage, addListener, removeListener } = useWebSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect();
    const handleConnected = () => setWsConnected(true);
    const handleDisconnected = () => setWsConnected(false);
    const handleChat = (data: any) => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        user: data.userName || "Team Member",
        message: data.content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    };
    addListener('connected', handleConnected);
    addListener('disconnected', handleDisconnected);
    addListener('chat_message', handleChat);
    return () => {
      disconnect();
      removeListener('connected', handleConnected);
      removeListener('disconnected', handleDisconnected);
      removeListener('chat_message', handleChat);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!message.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      user: profile?.first_name || "You",
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newMsg]);
    // Send via WebSocket
    sendChatMessage("project-1", message.trim());
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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">{profile?.first_name || "You"} (You)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Kunle A.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm">Kemi A.</span>
              </div>
              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setLocation("/enhanced-collaboration")}>Video Call</Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Project Chat
                {wsConnected ? (
                  <Badge variant="secondary" className="ml-auto"><Wifi className="w-3 h-3 mr-1" /> Live</Badge>
                ) : (
                  <Badge variant="outline" className="ml-auto"><WifiOff className="w-3 h-3 mr-1" /> Offline</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto p-3 bg-muted rounded-lg">
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
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()} />
                <Button size="icon" onClick={handleSend} disabled={!message.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
