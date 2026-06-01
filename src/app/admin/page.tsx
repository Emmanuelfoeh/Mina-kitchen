import { DashboardMetrics } from '@/components/admin/dashboard-metrics';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { PopularDishes } from '@/components/admin/popular-dishes';
import { RecentOrders } from '@/components/admin/recent-orders';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome back! Here&apos;s what&apos;s happening at your restaurant
            today.
          </p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white">
            <Plus className="w-4 h-4" />
            New Item
          </Button>
        </div> */}
      </div>

      {/* Metrics Grid */}
      <DashboardMetrics />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <PopularDishes />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}
