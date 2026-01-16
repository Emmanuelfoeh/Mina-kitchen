'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  {
    value: 'CONFIRMED',
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-blue-600',
  },
  {
    value: 'PREPARING',
    label: 'Preparing',
    icon: Package,
    color: 'text-orange-600',
  },
  {
    value: 'READY',
    label: 'Ready',
    icon: CheckCircle,
    color: 'text-purple-600',
  },
  {
    value: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Truck,
    color: 'text-indigo-600',
  },
  {
    value: 'DELIVERED',
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600',
  },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  async function handleStatusUpdate() {
    if (selectedStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          specialInstructions: notes || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        setIsOpen(false);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  }

  const currentStatusOption = statusOptions.find(
    option => option.value === currentStatus
  );
  const CurrentIcon = currentStatusOption?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#f97316] text-white hover:bg-[#ea580c]">
          <Edit className="h-4 w-4" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order and optionally add notes for the
            customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Current Status
            </Label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <CurrentIcon
                className={`h-4 w-4 ${currentStatusOption?.color}`}
              />
              <span className="font-medium">{currentStatusOption?.label}</span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <Label
              htmlFor="status"
              className="text-sm font-medium text-gray-700"
            >
              New Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or updates for the customer..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="bg-[#f97316] text-white hover:bg-[#ea580c]"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
