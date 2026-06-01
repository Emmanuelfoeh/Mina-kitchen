'use client';

import { useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAdminOrders } from '@/hooks/queries/use-admin-queries';
import {
  useUpdateOrderStatus,
  useBulkUpdateOrderStatus,
} from '@/hooks/mutations';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
  READY: 'bg-purple-100 text-purple-700 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, LucideIcon> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PREPARING: Package,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export function OrdersTable() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading: loading } = useAdminOrders({
    page: currentPage,
    limit: 20,
    search: '',
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const bulkUpdateMutation = useBulkUpdateOrderStatus();

  const orders = data?.orders || [];
  const pagination = data?.pagination || null;

  function updateOrderStatus(orderId: string, newStatus: string) {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  }

  function bulkUpdateStatus(newStatus: string) {
    if (selectedOrders.length === 0) return;

    bulkUpdateMutation.mutate(
      { orderIds: selectedOrders, status: newStatus },
      {
        onSuccess: () => {
          setSelectedOrders([]);
        },
      }
    );
  }

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = () => {
    setSelectedOrders(orders.map(order => order.id));
  };

  const handleDeselectAll = () => {
    setSelectedOrders([]);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => [...prev, orderId]);
  };

  const handleDeselectOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(id => id !== orderId));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="flex animate-pulse items-center gap-4 p-4"
          >
            <div className="h-4 w-4 rounded bg-gray-200"></div>
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <span className="text-sm font-medium text-orange-800">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''}{' '}
            selected
          </span>
          <div className="flex gap-2">
            <Select onValueChange={bulkUpdateStatus}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Mark as Confirmed</SelectItem>
                <SelectItem value="PREPARING">Mark as Preparing</SelectItem>
                <SelectItem value="READY">Mark as Ready</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">
                  Mark as Out for Delivery
                </SelectItem>
                <SelectItem value="DELIVERED">Mark as Delivered</SelectItem>
                <SelectItem value="CANCELLED">Mark as Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">
                <Checkbox
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                  onCheckedChange={checked =>
                    checked ? handleSelectAll() : handleDeselectAll()
                  }
                />
              </th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              {/* <th className="px-6 py-4">Items</th> */}
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length > 0 ? (
              orders.map(order => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={checked =>
                          checked
                            ? handleSelectOrder(order.id)
                            : handleDeselectOrder(order.id)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {order.orderNumber}
                      </div>
                      {order.scheduledFor && (
                        <div className="text-xs text-gray-500">
                          Scheduled: {formatDate(order.scheduledFor)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">
                        {order.customer?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.email || order.customerId}
                      </div>
                    </td>
                    {/* <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-600">
                      {formatOrderItems(order.items)}
                    </td> */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'gap-1 text-xs font-medium',
                          statusColors[order.status] ||
                            'bg-gray-100 text-gray-700'
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <Badge variant="secondary" className="text-xs">
                        {order.deliveryType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'confirmed')
                            }
                            disabled={order.status === 'confirmed'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'preparing')
                            }
                            disabled={order.status === 'preparing'}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Start Preparing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            disabled={order.status === 'ready'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Ready
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'out_for_delivery')
                            }
                            disabled={order.status === 'out_for_delivery'}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Out for Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'delivered')
                            }
                            disabled={order.status === 'delivered'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'cancelled')
                            }
                            disabled={order.status === 'cancelled'}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{' '}
            of {pagination.totalCount} orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
