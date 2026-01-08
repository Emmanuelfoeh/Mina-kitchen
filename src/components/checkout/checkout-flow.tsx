'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliverySelection } from './delivery-selection';
import { AddressForm } from './address-form';
import { OrderScheduling } from './order-scheduling';
import { OrderSummary } from './order-summary';
import { CheckCircle, Truck, Calendar, CreditCard } from 'lucide-react';

type CheckoutStep = 'delivery' | 'address' | 'scheduling' | 'summary';

interface CheckoutData {
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: any;
  scheduledFor?: Date;
  specialInstructions?: string;
}

export function CheckoutFlow() {
  const router = useRouter();
  const { items, hasItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryType: 'delivery',
  });

  // Redirect if cart is empty
  if (!hasItems()) {
    router.push('/menu');
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/checkout');
    return null;
  }

  const steps = [
    { id: 'delivery', title: 'Delivery Method', icon: Truck },
    { id: 'address', title: 'Address', icon: CheckCircle },
    { id: 'scheduling', title: 'Schedule', icon: Calendar },
    { id: 'summary', title: 'Review & Pay', icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as CheckoutStep);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as CheckoutStep);
    }
  };

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'delivery':
        return (
          <DeliverySelection
            selectedType={checkoutData.deliveryType}
            onSelect={type => updateCheckoutData({ deliveryType: type })}
            onNext={handleNext}
          />
        );
      case 'address':
        return (
          <AddressForm
            deliveryType={checkoutData.deliveryType}
            selectedAddress={checkoutData.deliveryAddress}
            onAddressSelect={address =>
              updateCheckoutData({ deliveryAddress: address })
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'scheduling':
        return (
          <OrderScheduling
            scheduledFor={checkoutData.scheduledFor}
            onScheduleSelect={date =>
              updateCheckoutData({ scheduledFor: date })
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'summary':
        return (
          <OrderSummary
            checkoutData={checkoutData}
            onBack={handleBack}
            onSpecialInstructionsChange={instructions =>
              updateCheckoutData({ specialInstructions: instructions })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Progress Steps */}
      <div className="lg:col-span-3">
        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  } `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-16 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-300'} `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex].title}</CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.quantity}x Item</p>
                    <p className="text-xs text-gray-500">
                      {item.selectedCustomizations.length > 0 &&
                        'With customizations'}
                    </p>
                  </div>
                  <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    ${useCartStore.getState().getSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${useCartStore.getState().getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>
                    ${useCartStore.getState().getDeliveryFee().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${useCartStore.getState().getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
