'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Store } from 'lucide-react';

interface DeliverySelectionProps {
  selectedType: 'delivery' | 'pickup';
  onSelect: (type: 'delivery' | 'pickup') => void;
  onNext: () => void;
}

export function DeliverySelection({
  selectedType,
  onSelect,
  onNext,
}: DeliverySelectionProps) {
  const deliveryOptions = [
    {
      id: 'delivery' as const,
      title: 'Delivery',
      description: 'Get your food delivered to your door',
      icon: Truck,
      estimatedTime: '30-45 min',
      fee: '$3.99',
    },
    {
      id: 'pickup' as const,
      title: 'Pickup',
      description: 'Pick up your order at our location',
      icon: Store,
      estimatedTime: '15-20 min',
      fee: 'Free',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {deliveryOptions.map(option => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'ring-primary border-primary bg-primary/5 ring-2'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onSelect(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`rounded-lg p-3 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'} `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">
                      {option.title}
                    </h3>
                    <p className="mb-3 text-sm text-gray-600">
                      {option.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <strong>Time:</strong> {option.estimatedTime}
                      </span>
                      <span
                        className={`font-medium ${
                          option.fee === 'Free'
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {option.fee}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType === 'pickup' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="mb-2 font-medium text-blue-900">Pickup Location</h4>
            <p className="text-sm text-blue-800">
              123 Main Street
              <br />
              Toronto, ON M5V 3A8
              <br />
              Phone: (416) 555-0123
            </p>
            <p className="mt-2 text-xs text-blue-700">
              <strong>Hours:</strong> Mon-Sun 11:00 AM - 10:00 PM
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
