'use client';

import {
  Phone,
  Mail,
  MapPin,
  Users,
  Camera,
  Map,
  Send,
  ChefHat,
} from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background-light transition-colors duration-200 dark:bg-background-dark text-text-dark dark:text-white">
      <main className="mx-auto flex-1 w-full max-w-[1440px] pb-16">
        <div className="mb-12 px-4 pt-6 md:px-10 md:pt-10">
          <div className="bg-surface-dark relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center shadow-xl md:min-h-[300px] md:p-12">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMkiY_FAo5BwKDsXq9MlsZro5K7faeaR8lI6fexWoI-0G9_86POcTZwkFTLyqcCivBODPH8pxtAw9FNCttBebrr-amL5AeWbNkE-Lkxap0zKUWT08QIS3ObQXw_2pV6riNG-RA44M_zkd7WWcNtftyFJv-M5iWdJNYwrtkn8mPFJe-rr9o7yDcyiVW8Fb9s0DVbHRaOU7zhR3AmX2s5oeBOaWoh7NgK9F20vQRRlKc854J2_Kxl5kVAVEes6KL9rMn9aKpklsO61U')",
              }}
            />
            <div className="from-background-dark via-background-dark/60 absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
            <div className="relative z-20 max-w-2xl">
              <h1 className="mb-4 text-4xl font-black text-white md:text-5xl lg:text-6xl">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-sm font-medium text-gray-300 md:text-lg">
                Have questions about our catering or daily menu? We're here to
                bring the taste of Africa to your doorstep in Canada.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 px-4 md:px-10 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="bg-white dark:bg-surface-dark contact-card-shadow rounded-3xl border border-neutral-light p-8 dark:border-neutral-dark">
              <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold">
                <span className="block h-6 w-1.5 rounded-full bg-primary"></span>
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      Phone
                    </p>
                    <p className="text-text-dark text-lg font-semibold dark:text-white">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      Email
                    </p>
                    <p className="text-text-dark text-lg font-semibold dark:text-white">
                      hello@chefskitchen.ca
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-earth-tone/10 text-earth-tone">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      Service Area
                    </p>
                    <p className="text-text-dark text-lg font-semibold dark:text-white">
                      Toronto & Greater Toronto Area, Ontario, Canada
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-neutral-light pt-8 dark:border-neutral-dark">
                <p className="text-text-muted mb-4 text-sm">
                  Follow us on social media for daily specials:
                </p>
                <div className="flex gap-3">
                  <a
                    className="bg-neutral-light dark:bg-neutral-dark flex size-10 items-center justify-center rounded-full transition-all hover:bg-primary hover:text-white"
                    href="#"
                  >
                    <Users size={20} />
                  </a>
                  <a
                    className="bg-neutral-light dark:bg-neutral-dark flex size-10 items-center justify-center rounded-full transition-all hover:bg-primary hover:text-white"
                    href="#"
                  >
                    <Camera size={20} />
                  </a>
                </div>
              </div>
            </div>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-light dark:border-neutral-dark">
              <div
                className="map-container absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHn3vGNzW-OG7pHl9G1aHp4aPAruvt-C9uh0I8lq2a4lD9-OXD0E9Xc9hYUrHWnB49XDXY3UTPm4JM8L__zVEoe6YIlVPodZW7jwEIaCtYFQW96xd0x4CnqvcoClnujnOZ0Rove8K3r_N6AOf9Fb6QGpYo3rjnlHJ_PyLu7P3mbLtR1r9jWZ1rkdmMPw6crHTe8R1SEcriVllDW_bD9crDD9HyoJ8PEbdTVoARkcnofrNbzgKKI5L64lN159tQbb2sqf5Mam9PiIQ')",
                }}
              />
              <div className="bg-neutral-light/50 dark:bg-neutral-dark/50 absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Map className="mb-3 text-5xl text-primary" size={48} />
                <h4 className="mb-2 text-lg font-bold">Our Delivery Range</h4>
                <p className="text-text-muted text-sm">
                  Serving within 50km of downtown Toronto. Contact us for
                  special event catering outside this range.
                </p>
                <button className="bg-white dark:bg-surface-dark border-neutral-light dark:border-neutral-dark mt-4 rounded-lg border px-4 py-2 text-xs font-bold transition-colors hover:bg-primary hover:text-white cursor-pointer">
                  View Interactive Map
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-surface-dark contact-card-shadow h-full rounded-3xl border border-neutral-light p-8 dark:border-neutral-dark md:p-12">
              <h3 className="mb-2 text-2xl font-bold">Send us a Message</h3>
              <p className="text-text-muted mb-8">
                We'll get back to you within 24 hours.
              </p>
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-text-dark ml-1 text-sm font-bold dark:text-gray-200">
                      Full Name
                    </label>
                    <input
                      className="bg-neutral-light/30 dark:bg-neutral-dark/30 border-neutral-light dark:border-neutral-dark h-12 w-full rounded-xl border px-4 transition-all focus:border-primary focus:ring-primary"
                      placeholder="John Doe"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-text-dark ml-1 text-sm font-bold dark:text-gray-200">
                      Email Address
                    </label>
                    <input
                      className="bg-neutral-light/30 dark:bg-neutral-dark/30 border-neutral-light dark:border-neutral-dark h-12 w-full rounded-xl border px-4 transition-all focus:border-primary focus:ring-primary"
                      placeholder="john@example.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-text-dark ml-1 text-sm font-bold dark:text-gray-200">
                    Subject
                  </label>
                  <select className="bg-neutral-light/30 dark:bg-neutral-dark/30 border-neutral-light dark:border-neutral-dark h-12 w-full rounded-xl border px-4 transition-all focus:border-primary focus:ring-primary">
                    <option>General Inquiry</option>
                    <option>Catering Request</option>
                    <option>Feedback</option>
                    <option>Business Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-text-dark ml-1 text-sm font-bold dark:text-gray-200">
                    Your Message
                  </label>
                  <textarea
                    className="bg-neutral-light/30 dark:bg-neutral-dark/30 border-neutral-light dark:border-neutral-dark w-full resize-none rounded-xl border p-4 transition-all focus:border-primary focus:ring-primary"
                    placeholder="How can we help you today?"
                    rows={6}
                  ></textarea>
                </div>
                <button
                  className="shadow-primary/25 hover:bg-primary/90 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-10 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 md:w-auto"
                  type="submit"
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 px-4 md:px-10">
          <div className="bg-neutral-light dark:bg-neutral-dark relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl p-8 md:flex-row">
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-10">
              <Image
                alt="Fresh ingredients"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnYnucxkMMU-xIxaQ9B5gAb1Eg6aGjkGK_K1n_TrIkIYtmMyhD3E3CKqzRGWJZXfM316zqVgUhDR4C_TAPKa5tJ7n93UYAQFkmoMqoh0XxhS6XovGjEVqoty1kGCRes8y1ELtOFJ4tE88XJorFr4lGmNOVHxB5RgQf_qKey96kWLffymyTNAcGRH4yJRwN6ZssG1t3TdMJaZ2QtwJkt10BNpMmWcoLUxM_WueW2d9rVinrmJJJNlhY1ocwRB5wPAe5MrQdFLVzktY"
                fill
                sizes="33vw"
              />
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-xl font-bold">
                Freshness is our secret ingredient
              </h4>
              <p className="text-text-muted">
                We source local Canadian produce and authentic African spices to
                ensure every meal tells a story of heritage and quality.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 text-center">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-text-muted text-xs font-bold uppercase">
                  Authentic
                </p>
              </div>
              <div className="border-neutral-dark/10 border-l px-4 text-center">
                <p className="text-2xl font-bold text-primary">Daily</p>
                <p className="text-text-muted text-xs font-bold uppercase">
                  Freshness
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-surface-dark border-t border-neutral-light dark:border-neutral-dark py-12 px-4 md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3 text-text-dark dark:text-white">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat size={20} />
            </div>
            <span className="text-lg font-bold">Chef's Kitchen</span>
          </div>
          <div className="text-text-muted flex gap-8 text-sm">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Catering
            </a>
          </div>
          <p className="text-text-muted text-sm">
            © 2024 Chef's Kitchen Canada. Authentic African Flavors.
          </p>
        </div>
      </footer>
    </div>
  );
}
