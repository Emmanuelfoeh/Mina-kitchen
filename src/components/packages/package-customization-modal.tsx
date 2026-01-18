'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/stores/cart-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useUserStore } from '@/stores/user-store';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  Users,
  Calendar,
  Repeat,
} from 'lucide-react';
import type { Package, MenuItem, SelectedCustomization } from '@/types';
import { SubscriptionSetup } from './subscription-setup';

interface PackageCustomizationModalProps {
  package: Package;
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

interface PackageItemCustomization {
  menuItemId: string;
  quantity: number;
  customizations: SelectedCustomization[];
}

export function PackageCustomizationModal({
  package: pkg,
  menuItems,
  isOpen,
  onClose,
}: PackageCustomizationModalProps) {
  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('one-time');
  const [customizations, setCustomizations] = useState<
    PackageItemCustomization[]
  >(
    pkg.includedItems.map(item => {
      // Find the menu item to get customization details
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customizations: item.includedCustomizations.map(customization => {
          const [customizationId, optionId] = customization.split(':');

          // Find the customization and option to get their names
          const customizationObj = menuItem?.customizations.find(
            c => c.id === customizationId
          );
          const option = customizationObj?.options.find(o => o.id === optionId);

          return {
            customizationId,
            customizationName: customizationObj?.name,
            optionIds: [optionId],
            optionNames: option ? [option.name] : undefined,
            textValue: undefined,
          };
        }),
      };
    })
  );

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCustomizations(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const updateCustomization = (
    menuItemId: string,
    customizationId: string,
    optionIds: string[],
    textValue?: string
  ) => {
    setCustomizations(prev =>
      prev.map(item => {
        if (item.menuItemId !== menuItemId) return item;

        // Find the menu item to get customization details
        const menuItem = menuItems.find(mi => mi.id === menuItemId);
        const customization = menuItem?.customizations.find(
          c => c.id === customizationId
        );
        const customizationName = customization?.name;

        // Get option names
        const optionNames = optionIds.map(optionId => {
          const option = customization?.options.find(o => o.id === optionId);
          return option?.name || optionId;
        });

        return {
          ...item,
          customizations: item.customizations.map(c =>
            c.customizationId === customizationId
              ? {
                  ...c,
                  customizationName,
                  optionIds,
                  optionNames,
                  textValue,
                }
              : c
          ),
        };
      })
    );
  };

  const calculateTotalPrice = () => {
    return customizations.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) return total;

      let itemPrice = menuItem.basePrice;

      // Add customization costs
      item.customizations.forEach(customization => {
        const customizationDef = menuItem.customizations.find(
          c => c.id === customization.customizationId
        );
        if (customizationDef) {
          customization.optionIds.forEach(optionId => {
            const option = customizationDef.options.find(
              o => o.id === optionId
            );
            if (option) {
              itemPrice += option.priceModifier;
            }
          });
        }
      });

      return total + itemPrice * item.quantity;
    }, 0);
  };

  const handleAddToCart = () => {
    // Add each customized item to cart
    customizations.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) return;

      let unitPrice = menuItem.basePrice;

      // Calculate unit price with customizations
      item.customizations.forEach(customization => {
        const customizationDef = menuItem.customizations.find(
          c => c.id === customization.customizationId
        );
        if (customizationDef) {
          customization.optionIds.forEach(optionId => {
            const option = customizationDef.options.find(
              o => o.id === optionId
            );
            if (option) {
              unitPrice += option.priceModifier;
            }
          });
        }
      });

      // Add to cart with package reference
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: `${item.menuItemId}-${Date.now()}-${i}`,
          menuItemId: item.menuItemId,
          name: menuItem.name,
          image: menuItem.image,
          quantity: 1,
          selectedCustomizations: item.customizations,
          specialInstructions: `From ${pkg.name} package`,
          unitPrice,
          totalPrice: unitPrice,
        });
      }
    });

    onClose();
  };

  const handleSubscriptionSuccess = () => {
    // Close modal after successful subscription
    onClose();
  };

  const getPackageTypeInfo = (type: Package['type']) => {
    switch (type) {
      case 'daily':
        return { label: 'Daily Package', icon: Clock, color: 'text-green-600' };
      case 'weekly':
        return { label: 'Weekly Package', icon: Users, color: 'text-blue-600' };
      case 'monthly':
        return {
          label: 'Monthly Package',
          icon: Users,
          color: 'text-purple-600',
        };
      default:
        return { label: 'Package', icon: Clock, color: 'text-gray-600' };
    }
  };

  const { label, icon: TypeIcon, color } = getPackageTypeInfo(pkg.type);
  const totalPrice = calculateTotalPrice();
  const originalPrice = pkg.price;
  const priceDifference = totalPrice - originalPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TypeIcon className={`h-6 w-6 ${color}`} />
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {pkg.name}
                </DialogTitle>
                <p className="mt-1 text-sm text-gray-600">{label}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="one-time" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                One-Time Purchase
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="flex items-center gap-2"
              >
                <Repeat className="h-4 w-4" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="one-time">
              <div className="space-y-6 pb-6">
                {/* Package Description */}
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="text-gray-700">{pkg.description}</p>
                </div>

                {/* Package Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customize Your Package
                  </h3>

                  {customizations.map(item => {
                    const menuItem = menuItems.find(
                      mi => mi.id === item.menuItemId
                    );
                    if (!menuItem) return null;

                    return (
                      <div
                        key={item.menuItemId}
                        className="space-y-4 rounded-lg border p-4"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={menuItem.image}
                              alt={menuItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {menuItem.name}
                                </h4>
                                <p className="mt-1 text-sm text-gray-600">
                                  {menuItem.description}
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                  {menuItem.category.name}
                                </Badge>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  ${menuItem.basePrice.toFixed(2)}
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(
                                        item.menuItemId,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(
                                        item.menuItemId,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Customizations */}
                            {menuItem.customizations.map(customization => {
                              const selectedCustomization =
                                item.customizations.find(
                                  c => c.customizationId === customization.id
                                );

                              if (customization.type === 'radio') {
                                return (
                                  <div key={customization.id} className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                      {customization.name}
                                      {customization.required && (
                                        <span className="ml-1 text-red-500">
                                          *
                                        </span>
                                      )}
                                    </label>
                                    <div className="space-y-2">
                                      {customization.options.map(option => (
                                        <label
                                          key={option.id}
                                          className="flex items-center"
                                        >
                                          <input
                                            type="radio"
                                            name={`${item.menuItemId}-${customization.id}`}
                                            value={option.id}
                                            checked={selectedCustomization?.optionIds.includes(
                                              option.id
                                            )}
                                            onChange={() =>
                                              updateCustomization(
                                                item.menuItemId,
                                                customization.id,
                                                [option.id]
                                              )
                                            }
                                            className="mr-2"
                                          />
                                          <span className="text-sm text-gray-700">
                                            {option.name}
                                            {option.priceModifier !== 0 && (
                                              <span className="ml-1 text-green-600">
                                                (+$
                                                {option.priceModifier.toFixed(
                                                  2
                                                )}
                                                )
                                              </span>
                                            )}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionSetup
                package={pkg}
                customizations={customizations.map(item => ({
                  menuItemId: item.menuItemId,
                  selectedCustomizations: item.customizations,
                }))}
                onSubscribe={handleSubscriptionSuccess}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer - Only for one-time purchases */}
        {activeTab === 'one-time' && (
          <div className="border-t p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">
                  Original Package Price
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${originalPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Customized Total</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${totalPrice.toFixed(2)}
                </div>
                {priceDifference !== 0 && (
                  <div
                    className={`text-sm ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {priceDifference > 0 ? '+' : ''}$
                    {priceDifference.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            <Button
              onClick={handleAddToCart}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition-all duration-200 hover:from-orange-600 hover:to-red-600"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add Package to Cart - ${totalPrice.toFixed(2)}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
