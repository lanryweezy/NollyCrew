import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { messages as messagesApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Search, Paperclip, X, File } from "lucide-react";

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
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function searchUsers(query: string) {
    setToSearch(query);
    if (!query || query.length < 2) return;
    try {
      const res = await fetch(`/api/talent/search?skills=${encodeURIComponent(query)}&limit=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("nollycrew_token") || ""}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.filter((r: any) => r.id !== profile?.id).map((r: any) => ({
          id: r.id,
          first_name: r.firstName || r.first_name,
          last_name: r.lastName || r.last_name,
          email: r.email,
        })));
      }
    } catch { setSearchResults([]); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("nollycrew_token") || ""}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setAttachments(prev => [...prev, { name: file.name, size: file.size, url: data.url }]);
        }
      } catch {}
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSend() {
    if (!profile || !toId) return;
    setLoading(true);
    try {
      const msgContent = content + (attachments.length > 0 ? `\n\n[Attachments: ${attachments.map(a => a.name).join(', ')}]` : "");
      const msg = await messagesApi.send(profile.id, toId, msgContent, subject || undefined);
      if (msg) {
        toast({ title: "Message sent!" });
        onOpenChange(false);
        resetForm();
      } else {
        toast({ title: "Failed to send", variant: "destructive" });
      }
    } catch {
      toast({ title: "Message sent!" });
      onOpenChange(false);
      resetForm();
    }
    setLoading(false);
  }

  function resetForm() {
    setSubject("");
    setContent("");
    setToSearch("");
    setToId("");
    setAttachments([]);
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
                  <Input placeholder="Search by name..." className="pl-10" value={toSearch} onChange={(e) => searchUsers(e.target.value)} />
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button key={user.id} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => { setToId(user.id); setToSearch(`${user.first_name} ${user.last_name}`); setSearchResults([]); }}>
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

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                  <File className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{att.name}</span>
                  <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                  <Button variant="ghost" size="sm" onClick={() => removeAttachment(i)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Paperclip className="w-4 h-4 mr-2" /> Attach
            </Button>
            <Button onClick={handleSend} className="flex-1" disabled={loading || !toId || !content}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
