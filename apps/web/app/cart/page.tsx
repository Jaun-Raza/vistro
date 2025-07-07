'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag, Check, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { checkoutWithStripe } from '../services/product';
import { checkoutWithPayPal } from '../services/product';
import Cookies from 'js-cookie';

const PUBLIC_SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

export default function CartPage() {
  const { state, removeItem, clearCart } = useCart();
  const { items, isLoading } = state;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;

  const isCartEmpty = items.length === 0;

  const token = Cookies.get('tok_UID');

  const handleCheckout = async () => {
    setIsProcessingPayment(true);

    try {
      const tok = token;
      const orderData = {
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          licenseType: item.licenseType,
          bundles: item.bundles || [],
          imageUrl: item.imageUrl
        })),
        subtotal: subtotal,
        total: total,
        paymentMethod: 'stripe',
        status: 'pending',
        createdAt: new Date().toISOString(),
        token: tok,
      };

      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      if (selectedPaymentMethod === 'stripe') {
        const stripeProducts = items.map(item => ({
          name: item.name,
          price: item.price,
          description: item.tagline || '',
        }));

        const result = await checkoutWithStripe(stripeProducts);

        if (result.success && result.id) {
          await localStorage.setItem('stripeSessionId', result.id);

          const { loadStripe } = await import('@stripe/stripe-js');
          const stripe = await loadStripe(PUBLIC_SECRET_KEY || "");

          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: result.id });
          }
        } else {
          throw new Error(result.error || 'Stripe payment initialization failed');
        }
      } else if (selectedPaymentMethod === 'paypal') {
        const paypalProducts = items.map(item => ({
          name: item.name,
          price: item.price,
          description: item.tagline || `${item.licenseType} license`,
          quantity: 1
        }));

        const result = await checkoutWithPayPal(paypalProducts);

        if (result.success && result.approvalUrl) {
          localStorage.setItem('paypalOrderId', result.orderId || "");
          window.location.href = result.approvalUrl;
        } else {
          throw new Error(result.error || 'PayPal payment initialization failed');
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Payment failed: ${error.message}. Please try again.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    !token ? <><div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center py-12 pt-40">
        <p className="text-2xl text-gray-400">Please log in to view your purchased products.</p>
      </div>
    </div></> : <>
      <div className="container h-[100%] mx-auto py-8 px-4 pt-25">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2 text-white">
          <ShoppingCart className="h-8 w-8" />
          Your Cart
        </h1>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded-md max-w-md mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded-md max-w-md mx-auto"></div>
            </div>
          </div>
        ) : isCartEmpty ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Your cart is empty</h2>
            <p className="text-gray-400 text-lg mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/browse">
              <Button className="mx-auto text-lg cursor-pointer p-4">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-white font-semibold">{items.length} {items.length === 1 ? 'Item' : 'Items'}</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-500 text-lg cursor-pointer flex gap-1 items-center">
                      <Trash2 className="h-4 w-4" />
                      Clear Cart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-2xl'>Clear your cart?</AlertDialogTitle>
                      <AlertDialogDescription className='text-lg'>
                        This will remove all items from your cart. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className='text-lg cursor-pointer'>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 cursor-pointer hover:bg-red-600 text-lg"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {items.map((item) => (
                <CartItemCard key={item.id} item={item} onRemove={removeItem} />
              ))}

              <div className="mt-8">
                <Link href="/browse">
                  <Button variant="outline" className="flex items-center gap-2 text-lg cursor-pointer">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="stripe"
                            checked={selectedPaymentMethod === 'stripe'}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedPaymentMethod('stripe');
                            }}
                          />
                          <label htmlFor="stripe" className="flex items-center space-x-2 cursor-pointer">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <span>Credit/Debit Card</span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="paypal"
                            checked={selectedPaymentMethod === 'paypal'}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedPaymentMethod('paypal');
                            }}
                          />
                          <label htmlFor="paypal" className="flex items-center space-x-2 cursor-pointer">
                            <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              P
                            </div>
                            <span>PayPal</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 text-lg cursor-pointer"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Proceed to Checkout with ${selectedPaymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}`
                      )}
                    </Button>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>Secure payment powered by {selectedPaymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CartItemCard({ item, onRemove }: { item: { id: string, name: string, tagline: string, price: number, licenseType: string, bundles?: any, imageUrl?: string }, onRemove: (id: string) => void; }) {
  const { id, name, tagline, price, licenseType, bundles = [], imageUrl } = item;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 h-hit-content">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-42 h-42 m-auto bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="h-12 w-12 text-gray-300" />
              </div>
            )}

          </div>

          <div className="px-4 py-2 flex-1">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-2xl">{name}</h3>
                {tagline && <p className="text-xl text-gray-500">{tagline}</p>}
                <p className="text-lg mt-1">
                  <span className="text-gray-600">License: </span>
                  <span className="font-medium">{licenseType}</span>
                </p>

                {/* Enhanced Bundles Display */}
                {bundles.length > 0 && (
                  <div className="mt-2">
                    <span className="text-lg text-gray-600 block mb-1">Bundles:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundles.map((bundle: any, index: any) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 text-sm"
                        >
                          <Check className="h-3 w-3" />
                          {bundle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right flex flex-col justify-between">
                <p className="font-semibold text-lg">£{price.toFixed(2)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 text-lg cursor-pointer hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}