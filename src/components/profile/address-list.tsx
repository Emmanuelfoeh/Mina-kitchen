'use client';

import { useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { Button } from '@/components/ui/button';
import { AddressForm } from './address-form';
import type { Address } from '@/types';

export function AddressList() {
  const { user, setDefaultAddress, deleteAddress, isLoading } = useUserStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Please log in to manage your addresses.</p>
      </div>
    );
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Delivery Addresses</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          Add New Address
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-4 text-lg font-medium">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            address={editingAddress}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </div>
      )}

      {!user.addresses || user.addresses.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 py-8 text-center">
          <p className="mb-4 text-gray-500">No addresses saved yet.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(user.addresses || []).map(address => (
            <div
              key={address.id}
              className={`rounded-lg border p-4 ${
                address.isDefault
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {address.isDefault && (
                    <span className="mb-2 inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                      Default Address
                    </span>
                  )}
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">
                      {address.street}
                      {address.unit && `, Unit ${address.unit}`}
                    </p>
                    <p>
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  {!address.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEdit(address)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(address.id)}
                    disabled={isLoading || address.isDefault}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:border-red-300 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
