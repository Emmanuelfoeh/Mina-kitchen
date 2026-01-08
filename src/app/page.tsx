import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Check,
  Star,
  Mail,
  Plus,
  ArrowRight,
  ShoppingCart,
  MapPin,
  Phone,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 pt-8 pb-12 md:px-10 lg:px-40 lg:py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-center">
            {/* Hero Text */}
            <div className="flex flex-1 flex-col gap-6 lg:max-w-[50%]">
              <div className="flex flex-col gap-3 text-left">
                <Badge className="inline-flex w-fit items-center gap-1 rounded-full border-0 bg-[#f2330d]/10 px-3 py-1 text-xs font-bold tracking-wide text-[#f2330d] uppercase">
                  🇨🇦 Authentic Taste in Canada
                </Badge>
                <h1 className="text-4xl leading-[1.1] font-extrabold tracking-[-0.033em] text-[#1c100d] lg:text-6xl">
                  Authentic African{' '}
                  <span className="text-[#f2330d]">Flavors</span>, Delivered to
                  You.
                </h1>
                <p className="max-w-[540px] text-base leading-relaxed font-normal text-[#5c4a45] lg:text-lg">
                  Experience the comforting taste of home with Chef's signature
                  Jollof, soups, and grilled specials. Freshly made in Canada,
                  rooted in tradition.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/menu">
                  <Button className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center rounded-lg bg-[#f2330d] px-6 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#d12b0a]">
                    Order Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center rounded-lg border border-[#e6dbd9] bg-white px-6 text-base font-bold text-[#1c100d] transition-all hover:bg-gray-50"
                >
                  View Packages
                </Button>
              </div>
              {/* Trust Signals */}
              <div className="mt-4 flex items-center gap-6 text-sm font-medium text-[#5c4a45]">
                <div className="flex items-center gap-2">
                  <Check className="text-[20px] text-[#f2330d]" />
                  <span>Halal Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-[20px] text-[#f2330d]" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative aspect-[4/3] max-h-[500px] w-full flex-1 lg:aspect-square lg:max-h-[600px]">
              {/* Decorative blob background */}
              <div className="absolute top-10 -right-10 h-full w-full rounded-full bg-[#fcece9] opacity-60 blur-3xl"></div>
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-200 bg-cover bg-center shadow-2xl"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
                }}
              ></div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xl lg:bottom-6 lg:-left-8">
                <div className="flex -space-x-3">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80')",
                    }}
                  ></div>
                  <div
                    className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&q=80')",
                    }}
                  ></div>
                  <div
                    className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80')",
                    }}
                  ></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1c100d]">
                    1k+ Happy Eaters
                  </p>
                  <div className="flex text-[10px] text-yellow-400">
                    <Star className="fill-current text-[14px]" />
                    <Star className="fill-current text-[14px]" />
                    <Star className="fill-current text-[14px]" />
                    <Star className="fill-current text-[14px]" />
                    <Star className="fill-current text-[14px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
          <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] text-[#1c100d]">
                Popular Dishes
              </h2>
              <p className="mt-2 text-[#5c4a45]">
                Local favorites that our customers can't get enough of.
              </p>
            </div>
            <Link
              href="/menu"
              className="flex items-center gap-1 text-sm font-semibold text-[#f2330d] hover:underline"
            >
              View Full Menu <ArrowRight className="text-[18px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {/* Dish Card 1 */}
            <Card className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-[#fcf9f8] transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div
                  className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
                  }}
                ></div>
                <div className="absolute top-3 right-3 rounded-md bg-white px-2 py-1 shadow-sm">
                  <span className="text-xs font-bold text-[#f2330d]">
                    Top Rated
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-tight font-bold text-[#1c100d]">
                    Smokey Jollof Rice
                  </h3>
                  <span className="text-lg font-bold text-[#f2330d]">
                    $18.00
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#5c4a45]">
                  Fire-wood smoked rice served with spicy grilled chicken and
                  fried plantain.
                </p>
                <Button className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-[#f2330d] bg-white py-2.5 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d] hover:text-white">
                  <Plus className="text-[18px]" />
                  Add to Order
                </Button>
              </div>
            </Card>

            {/* Dish Card 2 */}
            <Card className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-[#fcf9f8] transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div
                  className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')",
                  }}
                ></div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-tight font-bold text-[#1c100d]">
                    Egusi Soup & Yam
                  </h3>
                  <span className="text-lg font-bold text-[#f2330d]">
                    $22.00
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#5c4a45]">
                  Rich melon seed soup with spinach and assorted meat, served
                  with pounded yam.
                </p>
                <Button
                  variant="outline"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-[#f2330d] bg-white py-2.5 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d] hover:text-white"
                >
                  <Plus className="text-[18px]" />
                  Add to Order
                </Button>
              </div>
            </Card>

            {/* Dish Card 3 */}
            <Card className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-[#fcf9f8] transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div
                  className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')",
                  }}
                ></div>
                <div className="absolute top-3 right-3 rounded-md bg-white px-2 py-1 shadow-sm">
                  <span className="text-xs font-bold text-orange-600">
                    Spicy
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-tight font-bold text-[#1c100d]">
                    Beef Suya Platter
                  </h3>
                  <span className="text-lg font-bold text-[#f2330d]">
                    $24.00
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#5c4a45]">
                  Thinly sliced beef marinated in spicy peanut blend, grilled to
                  perfection with onions.
                </p>
                <Button
                  variant="outline"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-[#f2330d] bg-white py-2.5 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d] hover:text-white"
                >
                  <Plus className="text-[18px]" />
                  Add to Order
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Meal Packages Section */}
      <section className="relative bg-[#fcf9f8] py-16">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#1c100d 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>
        <div className="relative mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
          <div className="mb-12 text-center">
            <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] text-[#1c100d]">
              Weekly Meal Packages
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#5c4a45]">
              Save time and money with our curated meal boxes. Perfect for busy
              professionals and families.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Package 1 */}
            <Card className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Badge className="rounded-full border-0 bg-blue-100 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
                  Starter
                </Badge>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#1c100d]">
                The Weekly Taste
              </h3>
              <p className="mb-6 text-sm text-[#5c4a45]">
                Perfect for lunch breaks. A variety of rice dishes and sides.
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#1c100d]">$85</span>
                <span className="text-sm text-[#5c4a45]">/ week</span>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />5 Lunch Meals
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />1 Side Dish
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />
                  Free Delivery
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-auto w-full rounded-lg border border-[#f2330d] py-3 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d]/5"
              >
                Select Plan
              </Button>
            </Card>

            {/* Package 2 (Highlighted) */}
            <Card className="relative z-10 -mt-4 mb-4 flex flex-col rounded-2xl border-2 border-[#f2330d] bg-white p-6 shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2330d] px-4 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                Most Popular
              </div>
              <div className="mt-2 mb-4 flex items-center justify-between">
                <Badge className="rounded-full border-0 bg-[#f2330d]/10 px-3 py-1 text-xs font-bold tracking-wider text-[#f2330d] uppercase">
                  Standard
                </Badge>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#1c100d]">
                Couple's Delight
              </h3>
              <p className="mb-6 text-sm text-[#5c4a45]">
                Designed for two. Generous portions of our best sellers.
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#1c100d]">$160</span>
                <span className="text-sm text-[#5c4a45]">/ week</span>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />
                  10 Meals (Lunch & Dinner)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />2 Large Sides
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />2 Drinks
                  Included
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />
                  Priority Delivery
                </li>
              </ul>
              <Button className="mt-auto w-full rounded-lg bg-[#f2330d] py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#d12b0a]">
                Select Plan
              </Button>
            </Card>

            {/* Package 3 */}
            <Card className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Badge className="rounded-full border-0 bg-purple-100 px-3 py-1 text-xs font-bold tracking-wider text-purple-700 uppercase">
                  Family
                </Badge>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#1c100d]">
                Family Feast Box
              </h3>
              <p className="mb-6 text-sm text-[#5c4a45]">
                Feed the whole family with a variety of soups, swallows, and
                rice.
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#1c100d]">$280</span>
                <span className="text-sm text-[#5c4a45]">/ week</span>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />
                  20 Family-Sized Portions
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />4 Large Sides
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1c100d]">
                  <Check className="text-[18px] text-green-500" />
                  Weekend Special Treat
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-auto w-full rounded-lg border border-[#f2330d] py-3 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d]/5"
              >
                Select Plan
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <Badge
              variant="outline"
              className="border-[#f2330d] text-sm font-bold tracking-wider text-[#f2330d] uppercase"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold text-[#1c100d]">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-xl border border-[#f4e9e7] bg-[#fcf9f8] p-6">
              <div className="mb-4 flex gap-1 text-yellow-400">
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#5c4a45]">
                "Finally found authentic Jollof in Toronto! The smokiness is
                just right, and the delivery was super fast. Highly
                recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&q=80')",
                  }}
                ></div>
                <div>
                  <p className="text-sm font-bold text-[#1c100d]">Sarah M.</p>
                  <p className="text-xs text-[#5c4a45]">Toronto, ON</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border border-[#f4e9e7] bg-[#fcf9f8] p-6">
              <div className="mb-4 flex gap-1 text-yellow-400">
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#5c4a45]">
                "The Egusi soup reminds me so much of my grandmother's cooking.
                It's rich, flavorful, and the portions are generous."
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80')",
                  }}
                ></div>
                <div>
                  <p className="text-sm font-bold text-[#1c100d]">David O.</p>
                  <p className="text-xs text-[#5c4a45]">Mississauga, ON</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border border-[#f4e9e7] bg-[#fcf9f8] p-6">
              <div className="mb-4 flex gap-1 text-yellow-400">
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[20px]" />
                <Star className="fill-current text-[16px]" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#5c4a45]">
                "Subscribed to the Weekly Taste package for work lunches. It
                saves me so much time and the variety keeps it interesting."
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80')",
                  }}
                ></div>
                <div>
                  <p className="text-sm font-bold text-[#1c100d]">Jessica T.</p>
                  <p className="text-xs text-[#5c4a45]">North York, ON</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#f2330d] py-12 text-white">
        <div className="mx-auto flex max-w-[960px] flex-col items-center gap-6 px-4 text-center md:px-10">
          <div className="rounded-full bg-white/10 p-3">
            <Mail className="text-[32px]" />
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">
            Get Special Offers & New Menu Alerts
          </h2>
          <p className="max-w-md text-white/80">
            Join our community to receive exclusive discounts and be the first
            to know when new seasonal dishes arrive.
          </p>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Input
              className="flex-1 rounded-lg border-none px-4 py-3 text-[#1c100d] focus:ring-2 focus:ring-white/50"
              placeholder="Enter your email"
              type="email"
            />
            <Button className="rounded-lg bg-[#221310] px-6 py-3 font-bold text-white transition hover:bg-black/80">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f4e9e7] bg-[#fcf9f8] pt-12 pb-8">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4 flex items-center gap-2 text-[#1c100d]">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#f2330d]/10 text-[#f2330d]">
                  <span className="text-[18px]">🍳</span>
                </div>
                <span className="text-lg font-bold">Chef's Kitchen</span>
              </div>
              <p className="mb-4 text-sm text-[#5c4a45]">
                Bringing the warmth of African hospitality and the bold flavors
                of our heritage to your dining table in Canada.
              </p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                >
                  IG
                </Link>
                <Link
                  href="#"
                  className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                >
                  FB
                </Link>
                <Link
                  href="#"
                  className="text-[#5c4a45] transition-colors hover:text-[#f2330d]"
                >
                  TW
                </Link>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-[#1c100d]">Quick Links</h3>
              <ul className="flex flex-col gap-2 text-sm text-[#5c4a45]">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Packages
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Gift Cards
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-[#1c100d]">Support</h3>
              <ul className="flex flex-col gap-2 text-sm text-[#5c4a45]">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Delivery Areas
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[#f2330d]"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-[#1c100d]">Contact</h3>
              <ul className="flex flex-col gap-3 text-sm text-[#5c4a45]">
                <li className="flex items-center gap-2">
                  <MapPin className="text-[16px]" />
                  123 Culinary Ave, Toronto, ON
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="text-[16px]" />
                  (416) 555-0123
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="text-[16px]" />
                  hello@chefs-kitchen.ca
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#f4e9e7] pt-8 md:flex-row">
            <p className="text-xs text-[#5c4a45]">
              © 2024 Chef's Kitchen. All rights reserved.
            </p>
            <div className="flex gap-4">
              {/* Payment Icons placeholders */}
              <div className="h-6 w-10 rounded bg-gray-200"></div>
              <div className="h-6 w-10 rounded bg-gray-200"></div>
              <div className="h-6 w-10 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
