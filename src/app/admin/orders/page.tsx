import { Suspense } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { OrdersTable } from '@/components/admin/orders/orders-table';
import { OrdersStats } from '@/components/admin/orders/orders-stats';

export default function OrderManagementPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-gray-500">
            Manage customer orders, update status, and track deliveries
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <OrdersStats />
      </Suspense>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="createdAt">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="total">Order Total</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="scheduledFor">Scheduled Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
