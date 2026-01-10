'use client';
// import { Metadata } from 'next';
import Image from 'next/image';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  BadgeCheck,
  Leaf,
  Users,
  Utensils,
  Medal,
  Camera,
  ChefHat,
} from 'lucide-react';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

// export const metadata: Metadata = {
//   title: "Our Story - Chef's Kitchen",
//   description:
//     "Learn about our chef's journey from West Africa to Canada and our commitment to authentic African cuisine.",
// };

export default function AboutPage() {
  return (
    <div
      className={`${plusJakarta.variable} min-h-screen bg-background-light font-display text-text-dark transition-colors duration-200 dark:bg-background-dark dark:text-white`}
    >
      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 pb-16">
        {/* Hero Section */}
        <div className="mb-16 px-4 pt-6 md:px-10 md:pt-10">
          <div className="bg-surface-dark relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6 text-center shadow-2xl md:min-h-[500px] md:rounded-[3rem] md:p-12">
            <div
              className="absolute inset-0 z-0 scale-105 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnYnucxkMMU-xIxaQ9B5gAb1Eg6aGjkGK_K1n_TrIkIYtmMyhD3E3CKqzRGWJZXfM316zqVgUhDR4C_TAPKa5tJ7n93UYAQFkmoMqoh0XxhS6XovGjEVqoty1kGCRes8y1ELtOFJ4tE88XJorFr4lGmNOVHxB5RgQf_qKey96kWLffymyTNAcGRH4yJRwN6ZssG1t3TdMJaZ2QtwJkt10BNpMmWcoLUxM_WueW2d9rVinrmJJJNlhY1ocwRB5wPAe5MrQdFLVzktY')",
              }}
            />
            <div className="from-background-dark via-background-dark/70 absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
            <div className="relative z-20 max-w-3xl">
              <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/20 px-4 py-1 text-sm font-bold text-primary">
                Welcome to My Kitchen
              </span>
              <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
                Bringing African <span className="text-accent-gold">Soul</span>{' '}
                to Canadian Soil
              </h1>
              <p className="text-lg font-medium leading-relaxed text-gray-300 md:text-xl">
                A culinary journey that spans across oceans, blending heritage
                flavors with fresh local ingredients.
              </p>
            </div>
          </div>
        </div>

        {/* Journey Section */}
        <div className="mb-24 px-4 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-accent-gold/10 blur-3xl" />
                <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-primary uppercase">
                  Our Journey
                </h2>
                <h3 className="mb-6 text-3xl font-extrabold leading-tight text-text-dark dark:text-white md:text-4xl">
                  From the Vibrant Streets of Lagos to the Heart of Toronto
                </h3>
                <div className="text-text-muted space-y-4 text-lg leading-relaxed dark:text-gray-400">
                  <p>
                    Born into a family where the kitchen was the pulse of the
                    home, I grew up surrounded by the intoxicating aromas of
                    roasted spices and simmering stews. My journey didn't just
                    start with a recipe; it started with a feeling of community
                    and shared joy.
                  </p>
                  <p>
                    When I moved to Canada, I brought more than just my luggage.
                    I brought my mother's secret spice blends, my grandmother's
                    patience for the perfect Jollof, and a dream to share the
                    authentic taste of West Africa with my new neighbors.
                  </p>
                  <p>
                    Chef's Kitchen was born out of a desire to create a bridge
                    between two worlds—using the incredible bounty of Canadian
                    produce to showcase the depth and complexity of African
                    cuisine.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
              <div className="relative h-64 w-full translate-y-8 transform overflow-hidden rounded-3xl shadow-lg">
                <Image
                  alt="Fresh Spices"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMkiY_FAo5BwKDsXq9MlsZro5K7faeaR8lI6fexWoI-0G9_86POcTZwkFTLyqcCivBODPH8pxtAw9FNCttBebrr-amL5AeWbNkE-Lkxap0zKUWT08QIS3ObQXw_2pV6riNG-RA44M_zkd7WWcNtftyFJv-M5iWdJNYwrtkn8mPFJe-rr9o7yDcyiVW8Fb9s0DVbHRaOU7zhR3AmX2s5oeBOaWoh7NgK9F20vQRRlKc854J2_Kxl5kVAVEes6KL9rMn9aKpklsO61U"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="relative h-80 w-full overflow-hidden rounded-3xl shadow-lg">
                <Image
                  alt="Chef Cooking"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHn3vGNzW-OG7pHl9G1aHp4aPAruvt-C9uh0I8lq2a4lD9-OXD0E9Xc9hYUrHWnB49XDXY3UTPm4JM8L__zVEoe6YIlVPodZW7jwEIaCtYFQW96xd0x4CnqvcoClnujnOZ0Rove8K3r_N6AOf9Fb6QGpYo3rjnlHJ_PyLu7P3mbLtR1r9jWZ1rkdmMPw6crHTe8R1SEcriVllDW_bD9crDD9HyoJ8PEbdTVoARkcnofrNbzgKKI5L64lN159tQbb2sqf5Mam9PiIQ"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-24 px-4 md:px-10">
          <div className="bg-neutral-light/50 dark:bg-surface-dark/50 rounded-[2.5rem] border border-neutral-light p-8 dark:border-neutral-dark md:p-16">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-extrabold md:text-4xl">
                Our Mission
              </h2>
              <p className="text-text-muted text-lg dark:text-gray-400">
                To provide an authentic, gourmet African dining experience that
                honors tradition while embracing modern techniques and local
                sustainability.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="dark:bg-surface-dark rounded-3xl border border-neutral-light bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-xl dark:border-neutral-dark">
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BadgeCheck size={32} />
                </div>
                <h4 className="mb-3 text-xl font-bold">Authenticity</h4>
                <p className="text-text-muted text-sm dark:text-gray-400">
                  We never compromise on the traditional spices and methods that
                  define our heritage flavors.
                </p>
              </div>
              <div className="dark:bg-surface-dark rounded-3xl border border-neutral-light bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-xl dark:border-neutral-dark">
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold">
                  <Leaf size={32} />
                </div>
                <h4 className="mb-3 text-xl font-bold">Quality</h4>
                <p className="text-text-muted text-sm dark:text-gray-400">
                  Sourcing the freshest local Canadian produce to ensure every
                  dish meets our high standards.
                </p>
              </div>
              <div className="dark:bg-surface-dark rounded-3xl border border-neutral-light bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-xl dark:border-neutral-dark">
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-earth-tone/10 text-earth-tone">
                  <Users size={32} />
                </div>
                <h4 className="mb-3 text-xl font-bold">Community</h4>
                <p className="text-text-muted text-sm dark:text-gray-400">
                  Food is a language of love. We aim to bring people together
                  through shared culinary experiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chef Profile Section */}
        <div className="px-4 md:px-10">
          <div className="bg-earth-tone relative overflow-hidden rounded-[2.5rem] text-white">
            <div className="absolute top-0 right-0 h-full w-1/2 translate-x-1/4 skew-x-12 bg-primary/10" />
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
              <div className="relative z-10 flex items-center justify-center p-8 md:p-12 lg:col-span-5">
                <div className="aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border-8 border-white shadow-xl">
                  <Image
                    alt="Executive Chef"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDuwktG5lAJsMZppjqVsvgAS6cQsglY-GSQ7hYdF4g3nfpm-AiAi2QVWm7B7kik3Nqmv43snMPN9UrLMdC6nmwx3CceHpACU7337Zr3gFO3l8-Us1CCk58eENFxpvY108dPSbgCsDPnMJh_Ooj0ydFRRxiCGRvjRh2Iyj6usvFjiyN9DUVvBAO5qDs7SH0S3gss0Iv78Q8Edm4JhkCp5li1-jGYDhzdfX8IgeVhRBJG7_McM92emCg3zzikCam0n7llRSrrH_lZzI"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>
              <div className="relative z-10 flex flex-col justify-center p-8 md:p-16 lg:col-span-7">
                <span className="mb-4 text-sm font-bold tracking-widest text-accent-gold uppercase">
                  The Visionary
                </span>
                <h2 className="mb-6 text-4xl font-black md:text-5xl">
                  Meet Chef Adebayo
                </h2>
                <p className="text-neutral-light/80 mb-8 text-lg leading-relaxed">
                  With over 15 years of experience in both traditional African
                  catering and contemporary Canadian hospitality, Chef Adebayo
                  brings a unique perspective to the plate. Known for his
                  "no-shortcuts" approach, he personally oversees every spice
                  blend used in the kitchen.
                </p>
                <div className="mb-10 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <Utensils className="text-accent-gold" size={20} />
                    <span className="text-sm font-bold">
                      Culinary Arts Graduate
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <Medal className="text-accent-gold" size={20} />
                    <span className="text-sm font-bold">
                      15+ Years Experience
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">5k+</p>
                    <p className="text-[10px] font-bold text-accent-gold uppercase">
                      Happy Clients
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">40+</p>
                    <p className="text-[10px] font-bold text-accent-gold uppercase">
                      Original Recipes
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="flex gap-3">
                    <div className="hover:bg-primary flex size-10 items-center justify-center rounded-full border border-white/20 transition-colors cursor-pointer">
                      <Camera size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-light py-12 px-4 dark:bg-surface-dark dark:border-neutral-dark md:px-10">
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
