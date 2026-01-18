'use client';

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

interface OrderItem {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    menuItem: {
      name: string;
      image: string;
    };
  }>;
  total: number;
  status: string;
  deliveryType: string;
  scheduledFor?: string;
  createdAt: string;
}

interface OrdersResponse {
  orders: OrderItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
  READY: 'bg-purple-100 text-purple-700 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PREPARING: Package,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export function OrdersTable() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [pagination, setPagination] = useState<
    OrdersResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, sortBy]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/admin/orders?${params}`);

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders list
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }

  async function bulkUpdateStatus(newStatus: string) {
    if (selectedOrders.length === 0) return;

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: newStatus,
          bulkAction: true,
        }),
      });

      if (response.ok) {
        setSelectedOrders([]);
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to bulk update orders:', error);
    }
  }

  const formatOrderItems = (items: OrderItem['items']) => {
    return items
      .map(item => `${item.quantity}x ${item.menuItem.name}`)
      .join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
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
                  onCheckedChange={handleSelectAll}
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
                          handleSelectOrder(order.id, checked as boolean)
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
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer.email}
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
                              updateOrderStatus(order.id, 'CONFIRMED')
                            }
                            disabled={order.status === 'CONFIRMED'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'PREPARING')
                            }
                            disabled={order.status === 'PREPARING'}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Start Preparing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            disabled={order.status === 'READY'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Ready
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')
                            }
                            disabled={order.status === 'OUT_FOR_DELIVERY'}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Out for Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'DELIVERED')
                            }
                            disabled={order.status === 'DELIVERED'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order.id, 'CANCELLED')
                            }
                            disabled={order.status === 'CANCELLED'}
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
