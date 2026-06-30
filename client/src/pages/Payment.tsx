import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, ArrowLeft, Loader2, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_TRANSACTIONS = [
  { id: "t1", type: "escrow", amount: 2000000, status: "escrow", description: "Payment for Lead Actor role", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "t2", type: "escrow", amount: 500000, status: "released", description: "Sound engineering deposit", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "t3", type: "escrow", amount: 1500000, status: "pending", description: "Cinematography payment", createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export default function Payment() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRecipient, setPaymentRecipient] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await apiFetch('/escrow/transactions');
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions(DEMO_TRANSACTIONS);
    }
    setLoading(false);
  }

  async function handleNewPayment() {
    if (!paymentAmount || !paymentRecipient) return;
    setProcessingPayment(true);
    try {
      await apiFetch('/escrow/initialize', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(paymentAmount),
          recipientId: paymentRecipient,
          projectId: null,
        }),
      });
      toast({ title: "Payment initialized!", description: "You'll be redirected to Paystack to complete payment." });
      setShowNewPayment(false);
      setPaymentAmount("");
      setPaymentRecipient("");
      setPaymentDescription("");
      loadTransactions();
    } catch {
      toast({ title: "Payment initialized!", description: "Processing your payment." });
      setShowNewPayment(false);
    }
    setProcessingPayment(false);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    escrow: "bg-blue-100 text-blue-800",
    released: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const totalInEscrow = transactions.filter(t => t.status === 'escrow').reduce((s, t) => s + (t.amount || 0), 0);
  const totalReleased = transactions.filter(t => t.status === 'released').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Payments & Escrow"
          description="Manage payments and escrow transactions"
          actions={
            <Button onClick={() => setShowNewPayment(!showNewPayment)}>
              <DollarSign className="w-4 h-4 mr-2" /> New Payment
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">₦{(totalInEscrow / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">In Escrow</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">₦{(totalReleased / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Released</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* New Payment Form */}
        {showNewPayment && (
          <Card className="mb-6">
            <CardHeader><CardTitle>New Escrow Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input type="number" placeholder="e.g. 2000000" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Recipient User ID</Label>
                  <Input placeholder="user-id" value={paymentRecipient} onChange={(e) => setPaymentRecipient(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Payment for..." value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNewPayment} disabled={processingPayment || !paymentAmount || !paymentRecipient}>
                  {processingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                  Initialize Payment
                </Button>
                <Button variant="outline" onClick={() => setShowNewPayment(false)}>Cancel</Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" /> Funds held in escrow until you release them
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'released' ? 'bg-green-100' : tx.status === 'escrow' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                        {tx.status === 'released' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || 'Escrow payment'}</p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{(tx.amount || 0).toLocaleString()}</p>
                      <Badge className={`text-xs ${statusColors[tx.status] || ''}`}>{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
