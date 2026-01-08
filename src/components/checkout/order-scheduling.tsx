'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';

interface OrderSchedulingProps {
  scheduledFor?: Date;
  onScheduleSelect: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OrderScheduling({
  scheduledFor,
  onScheduleSelect,
  onNext,
  onBack,
}: OrderSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    scheduledFor ? scheduledFor.toISOString().split('T')[0] : ''
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    scheduledFor ? scheduledFor.toTimeString().slice(0, 5) : ''
  );

  // Generate available dates (today + next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isToday = i === 0;
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      dates.push({
        value: date.toISOString().split('T')[0],
        label: isToday ? `Today, ${dateStr}` : `${dayName}, ${dateStr}`,
        date: date,
      });
    }

    return dates;
  };

  // Generate available time slots
  const getAvailableTimeSlots = (dateStr: string) => {
    const selectedDateObj = new Date(dateStr);
    const now = new Date();
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    const slots = [];
    const startHour = 11; // 11 AM
    const endHour = 22; // 10 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = new Date(selectedDateObj);
        timeSlot.setHours(hour, minute, 0, 0);

        // Skip past time slots for today
        if (isToday && timeSlot <= now) {
          continue;
        }

        // Add 45 minutes buffer for preparation
        const bufferTime = new Date(now.getTime() + 45 * 60000);
        if (isToday && timeSlot < bufferTime) {
          continue;
        }

        const timeStr = timeSlot.toTimeString().slice(0, 5);
        const displayTime = timeSlot.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        slots.push({
          value: timeStr,
          label: displayTime,
        });
      }
    }

    return slots;
  };

  const availableDates = getAvailableDates();
  const availableTimeSlots = selectedDate
    ? getAvailableTimeSlots(selectedDate)
    : [];

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      onScheduleSelect(scheduledDateTime);
      onNext();
    }
  };

  const canContinue = selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Date Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="date">Delivery/Pickup Date</Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="time">Delivery/Pickup Time</Label>
            <Select
              value={selectedTime}
              onValueChange={setSelectedTime}
              disabled={!selectedDate}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedDate ? 'Choose a time' : 'Select date first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDate && availableTimeSlots.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No available time slots for this date. Please select another
                date.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Schedule Summary */}
      {selectedDate && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="mb-2 font-medium text-green-900">Scheduled Order</h4>
            <p className="text-green-800">
              Your order will be ready for{' '}
              <strong>
                {availableDates.find(d => d.value === selectedDate)?.label} at{' '}
                {availableTimeSlots.find(t => t.value === selectedTime)?.label}
              </strong>
            </p>
            <p className="mt-1 text-sm text-green-700">
              We'll send you updates as your order is prepared.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Business Hours Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="mb-2 font-medium text-blue-900">Business Hours</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              <strong>Monday - Sunday:</strong> 11:00 AM - 10:00 PM
            </p>
            <p>
              <strong>Preparation Time:</strong> 30-45 minutes
            </p>
            <p>
              <strong>Last Order:</strong> 9:30 PM
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
