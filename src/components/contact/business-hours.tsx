import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

const businessHours = [
  { day: 'Monday', hours: '11:00 AM - 9:00 PM', isToday: false },
  { day: 'Tuesday', hours: '11:00 AM - 9:00 PM', isToday: false },
  { day: 'Wednesday', hours: '11:00 AM - 9:00 PM', isToday: false },
  { day: 'Thursday', hours: '11:00 AM - 10:00 PM', isToday: false },
  { day: 'Friday', hours: '11:00 AM - 10:00 PM', isToday: false },
  { day: 'Saturday', hours: '12:00 PM - 10:00 PM', isToday: false },
  { day: 'Sunday', hours: '12:00 PM - 8:00 PM', isToday: false },
];

// Get current day to highlight today's hours
const getCurrentDay = () => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[new Date().getDay()];
};

export function BusinessHours() {
  const today = getCurrentDay();
  const hoursWithToday = businessHours.map(item => ({
    ...item,
    isToday: item.day === today,
  }));

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Clock className="h-6 w-6 text-orange-600" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {hoursWithToday.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                item.isToday
                  ? 'border border-orange-200 bg-orange-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`font-medium ${
                  item.isToday ? 'text-orange-800' : 'text-gray-700'
                }`}
              >
                {item.day}
                {item.isToday && (
                  <span className="ml-2 rounded-full bg-orange-600 px-2 py-1 text-xs text-white">
                    Today
                  </span>
                )}
              </span>
              <span
                className={`${
                  item.isToday ? 'font-medium text-orange-700' : 'text-gray-600'
                }`}
              >
                {item.hours}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Special Hours
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Holiday hours may vary</p>
                <p>• Last orders taken 30 minutes before closing</p>
                <p>• Delivery available during all business hours</p>
                <p>• Catering orders require 24-hour notice</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-blue-800">
              Currently Open
            </span>
          </div>
          <p className="text-sm text-blue-700">
            We're ready to serve you delicious African cuisine!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
