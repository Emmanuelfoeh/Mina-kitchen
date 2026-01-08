'use client';

import { useState } from 'react';
import { ProfileForm } from '@/components/profile/profile-form';
import { AddressList } from '@/components/profile/address-list';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>(
    'profile'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`border-b-2 px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`border-b-2 px-6 py-4 text-sm font-medium ${
                  activeTab === 'addresses'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Delivery Addresses
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileForm />}
            {activeTab === 'addresses' && <AddressList />}
          </div>
        </div>
      </div>
    </div>
  );
}
