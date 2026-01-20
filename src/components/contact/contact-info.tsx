import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

export function ContactInfo() {


//   Contact : 
// Email : wilmar35000@gmail.com
// Address: Gloucester Ontario, Ottawa
  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-lg">
      <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <span className="block h-6 w-1.5 rounded-full bg-orange-600"></span>
        Contact Information
      </h3>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Phone
            </p>
            <p className="text-lg font-semibold text-gray-900">
              (647) 446-5165
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Email
            </p>
            <p className="text-lg font-semibold text-gray-900">
              wilmar35000@gmail.com
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Service Area
            </p>
            <p className="text-lg font-semibold text-gray-900">
              Gloucester Ontario, Ottawa
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-8">
        <p className="mb-4 text-sm text-gray-500">
          Follow us on social media for daily specials:
        </p>
        <div className="flex gap-3">
          <a
            className="flex size-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-600 hover:text-white"
            href="#"
            aria-label="Facebook"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            className="flex size-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-600 hover:text-white"
            href="#"
            aria-label="Instagram"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
