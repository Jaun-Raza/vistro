'use client';
export const dynamic = 'force-dynamic';

import { JSX, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../CartContext';
import { 
  capturePayPalPayment, 
  verifyStripePayment, 
  confirmStripePayment,
  placeOrder 
} from '../services/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, Mail, Home, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: CustomerAddress;
}

interface OrderData {
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  tax: number;
  items: OrderItem[];
  customerInfo?: CustomerInfo;
  createdAt: string;
  completedAt?: string;
  paypalToken?: string;
  paypalPayerId?: string;
  paypalCaptureId?: string;
  payerEmail?: string;
  stripePaymentIntentId?: string;
  token: string;
}

type ProcessingStep = 'verifying' | 'capturing' | 'placing' | 'completed' | 'error';

export default function SuccessPage(): JSX.Element {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('verifying');
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Add a ref to track if payment processing has already been initiated
  const processingRef = useRef<boolean>(false);

  const getStepMessage = (step: ProcessingStep): string => {
    switch (step) {
      case 'verifying':
        return 'Verifying your payment...';
      case 'capturing':
        return 'Capturing payment details...';
      case 'placing':
        return 'Placing your order...';
      case 'completed':
        return 'Order completed successfully!';
      case 'error':
        return 'An error occurred';
      default:
        return 'Processing...';
    }
  };

  useEffect(() => {
    const handleSuccessfulPayment = async (): Promise<void> => {
      if (processingRef.current) {
        return;
      }
      processingRef.current = true;

      try {
        const paymentMethod = searchParams.get('payment') as 'stripe' | 'paypal' | null;
        const paypalToken = searchParams.get('token');
        const paypalPayerId = searchParams.get('PayerID');
        const stripePaymentIntentId = searchParams.get('payment_intent');

        const pendingOrderData = localStorage.getItem('pendingOrder');
        
        if (!pendingOrderData) {
          setError('No pending order found. Please try again.');
          setProcessingStep('error');
          return;
        }

        const order: OrderData = JSON.parse(pendingOrderData);

        if (!paymentMethod && processingStep !== 'completed') {
          setError('Payment method not specified.');
          setProcessingStep('error');
          return;
        }

        if (paymentMethod === 'paypal') {
          setProcessingStep('verifying');
          
          if (!paypalToken) {
            setError('PayPal token not found in URL parameters.');
            setProcessingStep('error');
            return;
          }

          const paypalOrderId = localStorage.getItem('paypalOrderId');
          
          if (!paypalOrderId) {
            setError('PayPal order ID not found. Please contact support.');
            setProcessingStep('error');
            return;
          }

          setProcessingStep('capturing');
          
          const captureResult = await capturePayPalPayment(paypalOrderId);
          
          if (!captureResult.success) {
            throw new Error(captureResult.error || 'Failed to capture PayPal payment');
          }

          // @ts-ignore
          order.paypalCaptureId = captureResult.captureId;
          // @ts-ignore
          order.payerEmail = captureResult.payerEmail;
          order.paypalToken = paypalToken;
          order.paypalPayerId = paypalPayerId || '';

          localStorage.removeItem('paypalOrderId');
          
        } else if (paymentMethod === 'stripe') {
          setProcessingStep('verifying');
          
          if (stripePaymentIntentId) {
            const verificationResult = await verifyStripePayment(stripePaymentIntentId);
            
            if (!verificationResult.success) {
              setProcessingStep('capturing');
              const confirmResult = await confirmStripePayment(stripePaymentIntentId);
              
              if (!confirmResult.success) {
                throw new Error(confirmResult.error || 'Failed to verify Stripe payment');
              }
              
              order.stripePaymentIntentId = stripePaymentIntentId;
            } else {
              order.stripePaymentIntentId = stripePaymentIntentId;
            }
          } else {
            const stripeSessionId = localStorage.getItem('stripeSessionId');
            if (stripeSessionId) {
              order.stripePaymentIntentId = stripeSessionId;
              localStorage.removeItem('stripeSessionId');
            } else {
              setError('Stripe payment information not found.');
              setProcessingStep('error');
              return;
            }
          }
        }

        // Update order status and prepare for database insertion
        const completedOrder: OrderData = {
          ...order,
          status: 'completed',
          completedAt: new Date().toISOString(),
          paymentStatus: 'paid',
          paymentMethod: paymentMethod || 'none'
        };

        // Place the order in the database
        setProcessingStep('placing');
        
        const placeOrderResult = await placeOrder({
          orderId: completedOrder.orderId,
          items: completedOrder.items,
          subtotal: completedOrder.subtotal,
          total: completedOrder.total,
          paymentMethod: completedOrder.paymentMethod,
          status: completedOrder.status,
          createdAt: completedOrder.createdAt,
          token: completedOrder.token,
          ...(completedOrder.paypalCaptureId && { paypalCaptureId: completedOrder.paypalCaptureId }),
          ...(completedOrder.payerEmail && { payerEmail: completedOrder.payerEmail }),
          ...(completedOrder.stripePaymentIntentId && { stripePaymentIntentId: completedOrder.stripePaymentIntentId })
        });

        if (!placeOrderResult.success) {
          throw new Error(placeOrderResult.error || 'Failed to place order in database');
        }

        // Update localStorage with order history
        const existingOrders: OrderData[] = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        existingOrders.push(completedOrder);
        localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
        
        // Clean up and complete
        localStorage.removeItem('pendingOrder');
        clearCart();
        
        setOrderData(completedOrder);
        setProcessingStep('completed');
          
      } catch (error) {
        console.error('Error processing successful payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your payment';
        setError(errorMessage);
        setProcessingStep('error');
      } finally {
        setIsLoading(false);
      }
    };

    handleSuccessfulPayment();
  }, [clearCart, router, searchParams, processingStep]); // Note: removed processingStep from dependencies since it could cause infinite loops

  // Loading state with step indicator
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2 mt-10">
            {getStepMessage(processingStep)}
          </h2>
          <p className="text-gray-400">Please wait while we process your order.</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${processingStep === 'verifying' ? 'bg-green-500 animate-pulse' : processingStep === 'capturing' || processingStep === 'placing' || processingStep === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${processingStep === 'capturing' ? 'bg-green-500 animate-pulse' : processingStep === 'placing' || processingStep === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${processingStep === 'placing' ? 'bg-green-500 animate-pulse' : processingStep === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Payment Processing Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              If your payment was charged, please contact our support team with your order details.
            </p>
            <div className="space-x-4">
              <Link href="/cart">
                <Button>Return to Cart</Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order not found state
  if (!orderData) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Order not found</h2>
          <p className="text-gray-400 mb-6">We couldn't find your order details.</p>
          <Link href="/cart">
            <Button>Return to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state - your existing JSX for displaying order details
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-400">Thank you for your purchase</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Paid with {orderData.paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Order Details</h2>
              <span className="text-lg font-mono bg-green-100 text-green-800 px-3 py-1 rounded">
                {orderData.orderId}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <p className="font-medium">
                    {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium capitalize">{orderData.paymentMethod}</p>
                </div>
              </div>

              {orderData.paypalCaptureId && (
                <div>
                  <span className="text-gray-600">PayPal Capture ID:</span>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {orderData.paypalCaptureId}
                  </p>
                </div>
              )}

              {orderData.stripePaymentIntentId && (
                <div>
                  <span className="text-gray-600">Stripe Payment ID:</span>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {orderData.stripePaymentIntentId}
                  </p>
                </div>
              )}

              {orderData.payerEmail && (
                <div>
                  <span className="text-gray-600">Payer Email:</span>
                  <p className="font-medium">{orderData.payerEmail}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {orderData.items?.map((item: OrderItem, index: number) => (
                    <div key={item.id || index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          £{(item.price)?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>£{orderData.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>£{orderData.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Order Confirmation Email</p>
                  <p className="text-sm">
                    We've sent a confirmation email to {orderData.customerInfo?.email || orderData.payerEmail || 'your email address'} with your order details and receipt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Download Access</p>
                  <p className="text-sm">
                    If your order includes digital products, download links will be available in your account.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/orders">
            <Button className="w-full sm:w-auto cursor-pointer">
              View Order History
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2 cursor-pointer" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center text-gray-300">
          <p className="text-sm">
            Need help with your order? Contact our support team at{' '}
            <a href="mailto:support@vistro.shop" className="text-blue-500 hover:underline">
              support@vistro.shop
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}