'use client';
export const dynamic = 'force-dynamic';

import { JSX, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, AlertTriangle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function FailureContent(): JSX.Element {
  const [failureReason, setFailureReason] = useState<string>('Payment could not be completed');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const cancelled = searchParams.get('cancelled');
    const paymentMethodParam = searchParams.get('payment');

    if (paymentMethodParam) setPaymentMethod(paymentMethodParam);

    let reason = 'Payment could not be completed';
    if (cancelled === 'true') {
      reason = 'Payment was cancelled';
    } else if (error) {
      switch (error.toLowerCase()) {
        case 'insufficient_funds': reason = 'Insufficient funds in your account'; break;
        case 'card_declined': reason = 'Your card was declined'; break;
        case 'expired_card': reason = 'Your card has expired'; break;
        case 'authentication_failed': reason = 'Payment authentication failed'; break;
        case 'network_error': reason = 'Network connection error occurred'; break;
        case 'paypal_error': reason = 'PayPal payment could not be processed'; break;
        case 'stripe_error': reason = 'Credit card payment failed'; break;
        default: reason = error.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    setFailureReason(reason);
  }, [searchParams]);

  const isCancelled = failureReason.toLowerCase().includes('cancelled');
  const failureColor = isCancelled ? 'yellow' : 'red';

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {isCancelled ? (
            <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-4xl font-bold text-white mb-2">
            {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>
          <p className="text-xl text-gray-400">Your payment could not be processed</p>
          {paymentMethod && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                failureColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                <CreditCard className="h-4 w-4 mr-1" />
                {paymentMethod === 'stripe' ? 'Credit Card' : 'PayPal'} Payment Failed
              </span>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className={`border rounded-lg p-6 ${
                failureColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  failureColor === 'yellow' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  What Happened?
                </h3>
                <p className={`text-lg ${
                  failureColor === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {failureReason}
                </p>
              </div>

              <div className="text-gray-600 space-y-2">
                <p>Don't worry - no charges have been made to your account.</p>
                <p>Your items are still in your cart and ready for checkout.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout"><Button className="w-full sm:w-auto"><ArrowLeft className="h-4 w-4 mr-2" />Try Again</Button></Link>
          <Link href="/cart"><Button variant="outline" className="w-full sm:w-auto">Back to Cart</Button></Link>
          <Link href="/"><Button variant="outline" className="w-full sm:w-auto"><Home className="h-4 w-4 mr-2" />Back to Home</Button></Link>
        </div>

        <div className="mt-8 text-center text-gray-300 text-sm">
          Having trouble with payments? Contact our support team at{' '}
          <a href="mailto:support@vistro.shop" className="text-blue-500 hover:underline">
            support@vistro.shop
          </a>
        </div>
      </div>
    </div>
  );
}
