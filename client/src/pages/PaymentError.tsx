
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function PaymentError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="mt-4">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error processing your payment. Please try again.</p>
        </CardContent>
      </Card>
    </div>
  );
}
