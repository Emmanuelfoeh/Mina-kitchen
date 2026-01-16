'use client';

import { Search, Bell, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock user for now
const user = {
  name: 'Fatima K.',
  role: 'Manager',
  image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
};

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
      <div className="w-96">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search orders, dishes, or customers..."
            className="border-gray-200 bg-gray-50 pl-10 transition-colors focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* View Store Button */}
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-gray-700 transition-colors hover:border-[#f2330d] hover:text-[#f2330d]"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">View Store</span>
          </Button>
        </Link>

        <button className="relative text-gray-400 transition-colors hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-none font-bold text-gray-900">
              {user.name}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {user.role}
            </p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
            <img
              src={user.image}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
