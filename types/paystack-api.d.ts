declare module 'paystack-api' {
  interface PaystackTransaction {
    initialize(data: {
      amount: number;
      email: string;
      callback_url?: string;
      metadata?: any;
      reference?: string;
    }): Promise<{
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    }>;
    
    verify(data: { reference: string }): Promise<{
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
      };
    }>;
  }

  interface PaystackClient {
    transaction: PaystackTransaction;
  }

  export default function paystackapi(secretKey: string): PaystackClient;
}