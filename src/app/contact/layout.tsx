import { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us - Get in Touch',
  description:
    'Contact Mina Kitchen for inquiries, catering requests, or feedback. Located in Toronto, we serve authentic West African cuisine across the GTA. Call us or visit our restaurant.',
  keywords: [
    'contact African restaurant Toronto',
    'Mina Kitchen location',
    'African catering Toronto',
    'restaurant contact information',
    'West African food inquiries',
    'Toronto African cuisine',
    'restaurant reservations',
    'catering services Toronto',
  ],
  url: '/contact',
  type: 'website',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
