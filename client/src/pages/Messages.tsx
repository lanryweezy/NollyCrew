import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { messages as messagesApi } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ComposeMessage from "@/components/ComposeMessage";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Inbox, Loader2, PenSquare } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_MESSAGES = [
  { id: "m1", sender_id: "user1", subject: "Casting Call: Lead Role", content: "Hi, we'd love to audition you for our upcoming film...", is_read: false, sent_at: new Date().toISOString(), sender: { first_name: "Chidi", last_name: "Okoro", avatar: null } },
  { id: "m2", sender_id: "user2", subject: "Project Collaboration", content: "Interested in working together on the documentary?", is_read: true, sent_at: new Date(Date.now() - 86400000).toISOString(), sender: { first_name: "Ngozi", last_name: "Eze", avatar: null } },
  { id: "m3", sender_id: "user3", subject: "Job Application Update", content: "Your application has been shortlisted!", is_read: false, sent_at: new Date(Date.now() - 172800000).toISOString(), sender: { first_name: "Funke", last_name: "Adeyemi", avatar: null } },
];

export default function Messages() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messageList, setMessageList] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    setLoading(true);
    if (isSupabaseConfigured() && profile) {
      const data = await messagesApi.getInbox(profile.id);
      setMessageList(data);
    } else {
      setMessageList(DEMO_MESSAGES);
    }
    setLoading(false);
  }

  async function handleSendReply() {
    if (!selectedMessage || !profile || !replyText.trim()) return;
    if (isSupabaseConfigured()) {
      await messagesApi.send(profile.id, selectedMessage.sender_id, replyText);
    }
    setReplyText("");
    toast({ title: "Reply sent!" });
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messageList.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-full h-full" />}
            title="No messages yet"
            description="Start a conversation from a talent profile or job posting"
            action={<Button onClick={() => setShowCompose(true)}>Send a Message</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
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
                          {!msg.is_read && <Badge className="w-2 h-2 p-0 rounded-full" />}
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
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      From: {selectedMessage.sender?.first_name} {selectedMessage.sender?.last_name} •{" "}
                      {new Date(selectedMessage.sent_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    <div className="mt-6 flex gap-2">
                      <Input placeholder="Type a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                      <Button size="icon" onClick={handleSendReply}><Send className="w-4 h-4" /></Button>
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
