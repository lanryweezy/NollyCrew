import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { messages as messagesApi } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ComposeMessage from "@/components/ComposeMessage";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Inbox, Loader2, PenSquare, Wifi, WifiOff } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { MessagesSkeleton } from "@/components/PageSkeletons";

const DEMO_MESSAGES = [
  { id: "m1", sender_id: "user1", subject: "Casting Call: Lead Role", content: "Hi, we'd love to audition you for our upcoming film...", is_read: false, sent_at: new Date().toISOString(), sender: { first_name: "Chidi", last_name: "Okoro", avatar: null } },
  { id: "m2", sender_id: "user2", subject: "Project Collaboration", content: "Interested in working together on the documentary?", is_read: true, sent_at: new Date(Date.now() - 86400000).toISOString(), sender: { first_name: "Ngozi", last_name: "Eze", avatar: null } },
  { id: "m3", sender_id: "user3", subject: "Job Application Update", content: "Your application has been shortlisted!", is_read: false, sent_at: new Date(Date.now() - 172800000).toISOString(), sender: { first_name: "Funke", last_name: "Adeyemi", avatar: null } },
];

export default function Messages() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { connect, disconnect, addListener, removeListener } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [messageList, setMessageList] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Connect WebSocket
    connect();

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.recipientId === profile?.id) {
        loadMessages(); // Refresh inbox
        toast({ title: "New message!", description: `From ${data.senderName || 'someone'}` });
      }
    };

    const handleConnected = () => setWsConnected(true);
    const handleDisconnected = () => setWsConnected(false);
    const handleTyping = (data: any) => {
      if (data.userId !== profile?.id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    };

    addListener('new_message', handleNewMessage);
    addListener('connected', handleConnected);
    addListener('disconnected', handleDisconnected);
    addListener('typing_indicator', handleTyping);

    return () => {
      disconnect();
      removeListener('new_message', handleNewMessage);
      removeListener('connected', handleConnected);
      removeListener('disconnected', handleDisconnected);
      removeListener('typing_indicator', handleTyping);
    };
  }, [profile?.id]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await messagesApi.getInbox(profile?.id || '');
      setMessageList(data.length > 0 ? data : DEMO_MESSAGES);
    } catch {
      setMessageList(DEMO_MESSAGES);
    }
    setLoading(false);
  }

  async function handleSendReply() {
    if (!selectedMessage || !profile || !replyText.trim()) return;
    const text = replyText.trim();
    setReplyText("");
    try {
      await messagesApi.send(profile.id, selectedMessage.sender_id, text);
      // Add to local list immediately
      setMessageList(prev => [{
        id: `temp-${Date.now()}`,
        sender_id: profile.id,
        recipient_id: selectedMessage.sender_id,
        subject: selectedMessage.subject,
        content: text,
        is_read: true,
        sent_at: new Date().toISOString(),
        sender: { first_name: profile.first_name, last_name: profile.last_name, avatar: profile.avatar },
      }, ...prev]);
    } catch {
      toast({ title: "Reply sent! (Demo)" });
    }
  }

  function formatTime(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Messages"
          description="Your conversations"
          actions={
            <Button onClick={() => setShowCompose(true)}>
              <PenSquare className="w-4 h-4 mr-2" /> Compose
            </Button>
          }
        />

        {loading ? (
          <MessagesSkeleton />
        ) : messageList.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-full h-full" />}
            title="No messages yet"
            description="Start a conversation from a talent profile or job posting"
            action={<Button onClick={() => setShowCompose(true)}>Send a Message</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
              {messageList.map((msg) => (
                <Card
                  key={msg.id}
                  className={`cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? "border-primary" : ""} ${!msg.is_read ? "bg-primary/5" : ""}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {msg.sender?.first_name?.[0]}{msg.sender?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{msg.sender?.first_name} {msg.sender?.last_name}</p>
                          <span className="text-xs text-muted-foreground">{formatTime(msg.sent_at)}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="md:col-span-2">
              {selectedMessage ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          From: {selectedMessage.sender?.first_name} {selectedMessage.sender?.last_name} •{" "}
                          {formatTime(selectedMessage.sent_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto mb-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    {typing && (
                      <p className="text-xs text-muted-foreground italic mb-2">Typing...</p>
                    )}
                    <div className="flex gap-2 flex-shrink-0">
                      <Input 
                        placeholder="Type a reply..." 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                      />
                      <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a message to read</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <ComposeMessage open={showCompose} onOpenChange={setShowCompose} />
    </div>
  );
}
