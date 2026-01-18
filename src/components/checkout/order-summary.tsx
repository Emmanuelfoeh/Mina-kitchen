'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CreditCard, FileText } from 'lucide-react';

interface CheckoutData {
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: any;
  scheduledFor?: Date;
  specialInstructions?: string;
}

interface OrderSummaryProps {
  checkoutData: CheckoutData;
  onBack: () => void;
  onSpecialInstructionsChange: (instructions: string) => void;
}

export function OrderSummary({
  checkoutData,
  onBack,
  onSpecialInstructionsChange,
}: OrderSummaryProps) {
  const router = useRouter();
  const { items, getSubtotal, getTax, getDeliveryFee, getTotal } =
    useCartStore();
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        customerId: user.id,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customizations: item.selectedCustomizations,
          specialInstructions: item.specialInstructions,
          totalPrice: item.totalPrice,
        })),
        deliveryType: checkoutData.deliveryType.toUpperCase(),
        deliveryAddressId: checkoutData.deliveryAddress?.id,
        scheduledFor: checkoutData.scheduledFor?.toISOString(),
        specialInstructions: checkoutData.specialInstructions,
        subtotal: getSubtotal(),
        tax: getTax(),
        deliveryFee:
          checkoutData.deliveryType === 'pickup' ? 0 : getDeliveryFee(),
        total:
          getSubtotal() +
          getTax() +
          (checkoutData.deliveryType === 'pickup' ? 0 : getDeliveryFee()),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart after successful order
        useCartStore.getState().clearCart();

        // Redirect to confirmation page
        router.push(`/order-confirmation?orderId=${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-start justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <Badge variant="secondary">{item.quantity}x</Badge>
                    <h4 className="font-medium">
                      {item.name || `Menu Item #${item.menuItemId}`}
                    </h4>
                  </div>

                  {item.selectedCustomizations.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {item.selectedCustomizations.map(
                        (customization, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            <span className="font-medium">
                              {customization.customizationName ||
                                'Customization'}
                              :
                            </span>
                            {customization.optionIds.length > 0 && (
                              <span className="ml-1">
                                {customization.optionNames?.length
                                  ? customization.optionNames.join(', ')
                                  : customization.optionIds.join(', ')}
                              </span>
                            )}
                            {customization.textValue && (
                              <span className="ml-1 italic">
                                "{customization.textValue}"
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {item.specialInstructions && (
                    <div className="ml-6 text-sm text-gray-600">
                      <span className="font-medium">Special Instructions:</span>
                      <span className="ml-1">{item.specialInstructions}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {checkoutData.deliveryType === 'delivery'
              ? 'Delivery'
              : 'Pickup'}{' '}
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkoutData.deliveryType === 'delivery' ? (
            <div>
              <h4 className="mb-2 font-medium">Delivery Address</h4>
              {checkoutData.deliveryAddress ? (
                <div className="text-gray-700">
                  <p>{checkoutData.deliveryAddress.street}</p>
                  {checkoutData.deliveryAddress.unit && (
                    <p>Unit {checkoutData.deliveryAddress.unit}</p>
                  )}
                  <p>
                    {checkoutData.deliveryAddress.city},{' '}
                    {checkoutData.deliveryAddress.province}{' '}
                    {checkoutData.deliveryAddress.postalCode}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No address selected</p>
              )}
            </div>
          ) : (
            <div>
              <h4 className="mb-2 font-medium">Pickup Location</h4>
              <div className="text-gray-700">
                <p>123 Main Street</p>
                <p>Toronto, ON M5V 3A8</p>
                <p className="mt-1 text-sm text-gray-600">
                  Phone: (416) 555-0123
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkoutData.scheduledFor ? (
            <div>
              <p className="text-lg font-medium">
                {formatDateTime(checkoutData.scheduledFor)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {checkoutData.deliveryType === 'delivery'
                  ? 'Estimated delivery time'
                  : 'Ready for pickup'}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No schedule selected</p>
          )}
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="instructions">
            Add any special instructions for your order (optional)
          </Label>
          <Textarea
            id="instructions"
            placeholder="e.g., Please ring the doorbell, Leave at door, etc."
            value={checkoutData.specialInstructions || ''}
            onChange={e => onSpecialInstructionsChange(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax (HST)</span>
              <span>${getTax().toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>
                {checkoutData.deliveryType === 'delivery'
                  ? 'Delivery Fee'
                  : 'Service Fee'}
              </span>
              <span>
                {checkoutData.deliveryType === 'delivery'
                  ? `$${getDeliveryFee().toFixed(2)}`
                  : 'Free'}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                $
                {(
                  getSubtotal() +
                  getTax() +
                  (checkoutData.deliveryType === 'pickup'
                    ? 0
                    : getDeliveryFee())
                ).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Payment:</strong> Our team will contact you after order
              confirmation to arrange payment. You can pay by cash, e-transfer,
              or card upon {checkoutData.deliveryType}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing
            ? 'Processing...'
            : `Place Order - $${(getSubtotal() + getTax() + (checkoutData.deliveryType === 'pickup' ? 0 : getDeliveryFee())).toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
