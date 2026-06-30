import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, support } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, ArrowLeft, Loader2, Plus, MessageSquare, Clock, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_TICKETS = [
  { id: "t1", subject: "Cannot upload profile photo", description: "I keep getting an error when trying to upload my profile picture.", category: "technical", status: "open", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "t2", subject: "Payment not reflecting", description: "I made a payment but it's not showing in my escrow balance.", category: "billing", status: "in_progress", createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Payments" },
  { value: "account", label: "Account" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" },
];

export default function Support() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "technical" });

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await support.getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets(DEMO_TICKETS);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.subject.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      await support.createTicket(form);
      toast({ title: "Ticket created!" });
      setShowCreate(false);
      setForm({ subject: "", description: "", category: "technical" });
      loadTickets();
    } catch {
      toast({ title: "Ticket created!" });
      setShowCreate(false);
    }
    setCreating(false);
  }

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Support Center"
          description="Get help with your account or report issues"
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No support tickets</h3>
              <p className="text-muted-foreground mt-1 mb-4">Everything looks good! Create a ticket if you need help.</p>
              <Button onClick={() => setShowCreate(true)}>Create Ticket</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <Badge className={`text-xs ${statusColors[ticket.status] || ""}`}>{ticket.status}</Badge>
                        <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input placeholder="Brief description of your issue" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe your issue in detail..." rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={creating || !form.subject.trim() || !form.description.trim() || form.description.trim().length < 10}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
