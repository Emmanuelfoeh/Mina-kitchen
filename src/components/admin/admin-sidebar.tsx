'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Live Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    badge: '12',
  },
  {
    title: 'Menu Management',
    href: '/admin/menu',
    icon: BookOpen,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear admin token
    document.cookie =
      'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    // Redirect to admin login
    router.push('/admin/login');
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-white',
        className
      )}
    >
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">
            AE
          </div>
          <div>
            <h1 className="text-lg leading-none font-bold">Mina’s Kitchen</h1>
            <span className="text-muted-foreground text-xs">Admin Panel</span>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-600',
                  isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-gray-100 p-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
