import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#f4e9e7] bg-[#fcf9f8] pt-12 pb-8">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2 text-[#1c100d]">
              <div className="flex size-6 items-center justify-center rounded-md bg-[#f2330d]/10 text-[#f2330d]">
                <span className="text-[18px]">🍳</span>
              </div>
              <span className="text-lg font-bold">Mina's Kitchen</span>
            </div>
            <p className="mb-4 text-sm text-[#5c4a45]">
              Bringing the warmth of African hospitality and the bold flavors of
              our heritage to your dining table in Canada.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                aria-label="Instagram"
              >
                IG
              </Link>
              <Link
                href="#"
                className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                aria-label="Facebook"
              >
                FB
              </Link>
              <Link
                href="#"
                className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                aria-label="Twitter"
              >
                TW
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-bold text-[#1c100d]">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-[#5c4a45]">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-bold text-[#1c100d]">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-[#5c4a45]">
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#faq"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#delivery"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Delivery Areas
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-bold text-[#1c100d]">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-[#5c4a45]">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>123 Culinary Ave, Toronto, ON</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a
                  href="tel:+14165550123"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  (416) 555-0123
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a
                  href="mailto:hello@mina-kitchen.ca"
                  className="transition-colors hover:text-[#f2330d]"
                >
                  hello@mina-kitchen.ca
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#f4e9e7] pt-8 md:flex-row">
          <p className="text-xs text-[#5c4a45]">
            © {currentYear} Mina's Kitchen. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Payment Icons placeholders */}
            <div
              className="h-6 w-10 rounded bg-gray-200"
              aria-label="Visa accepted"
            ></div>
            <div
              className="h-6 w-10 rounded bg-gray-200"
              aria-label="Mastercard accepted"
            ></div>
            <div
              className="h-6 w-10 rounded bg-gray-200"
              aria-label="American Express accepted"
            ></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
