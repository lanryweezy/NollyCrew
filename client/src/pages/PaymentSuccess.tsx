
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="mt-4">Payment Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Thank you for your payment!</p>
        </CardContent>
      </Card>
    </div>
  );
}
