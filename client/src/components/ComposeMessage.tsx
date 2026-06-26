import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { messages as messagesApi, profiles } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Search } from "lucide-react";

interface ComposeMessageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientName?: string;
}

export default function ComposeMessage({ open, onOpenChange, recipientId, recipientName }: ComposeMessageProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [toSearch, setToSearch] = useState(recipientName || "");
  const [toId, setToId] = useState(recipientId || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  async function searchUsers(query: string) {
    setToSearch(query);
    if (!query || query.length < 2 || !isSupabaseConfigured()) return;
    const results = await profiles.search(query);
    setSearchResults(results.filter(r => r.id !== profile?.id));
  }

  async function handleSend() {
    if (!profile || !toId) return;
    setLoading(true);

    if (isSupabaseConfigured()) {
      const msg = await messagesApi.send(profile.id, toId, content, subject || undefined);
      if (msg) {
        toast({ title: "Message sent!" });
        onOpenChange(false);
        setSubject("");
        setContent("");
        setToSearch("");
        setToId("");
      } else {
        toast({ title: "Failed to send", variant: "destructive" });
      }
    } else {
      toast({ title: "Sent! (Demo)" });
      onOpenChange(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Start a conversation</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            {recipientId ? (
              <Input value={recipientName || "User"} disabled />
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    className="pl-10"
                    value={toSearch}
                    onChange={(e) => searchUsers(e.target.value)}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => {
                          setToId(user.id);
                          setToSearch(`${user.first_name} ${user.last_name}`);
                          setSearchResults([]);
                        }}
                      >
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label>Subject (optional)</Label>
            <Input placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea placeholder="Write your message..." rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <Button onClick={handleSend} className="w-full" disabled={loading || !toId || !content}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
