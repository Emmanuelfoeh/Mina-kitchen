'use client';

import { useCartSafe } from './cart-provider';
import { formatCurrency } from '@/utils';
import { calculateTax, calculateDeliveryFee } from '@/utils';

interface PriceBreakdownProps {
  showTitle?: boolean;
  showEstimatedTime?: boolean;
  className?: string;
}

export function PriceBreakdown({
  showTitle = true,
  showEstimatedTime = true,
  className = '',
}: PriceBreakdownProps) {
  const { items } = useCartSafe();

  // Calculate values directly from items to ensure reactivity
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
  const tax = calculateTax(subtotal);
  const deliveryFee = calculateDeliveryFee();
  const total = subtotal + tax + deliveryFee;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && <h3 className="text-sm font-medium">Order Summary</h3>}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax (HST 13%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {showEstimatedTime && (
          <p className="mt-1 text-xs text-gray-500">
            Estimated delivery time: 45-60 minutes
          </p>
        )}
      </div>
    </div>
  );
}

// Utility component for displaying individual price line items
interface PriceLineProps {
  label: string;
  amount: number;
  className?: string;
}

export function PriceLine({ label, amount, className = '' }: PriceLineProps) {
  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <span>{label}</span>
      <span>{formatCurrency(amount)}</span>
    </div>
  );
}

// Component for displaying savings or discounts
interface SavingsLineProps {
  label: string;
  amount: number;
  className?: string;
}

export function SavingsLine({
  label,
  amount,
  className = '',
}: SavingsLineProps) {
  return (
    <div className={`flex justify-between text-sm text-green-600 ${className}`}>
      <span>{label}</span>
      <span>-{formatCurrency(amount)}</span>
    </div>
  );
}
