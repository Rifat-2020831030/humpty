import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TRPCProvider } from '@/trpc/Provider';

export const metadata: Metadata = {
  title: 'GariKoi (গাড়ী কই?) - Dhaka Rideshare PWA',
  description:
    'Dhaka Progressive Web App for fast, flexible ridesharing with live GPS and manual location overrides, AI landmark search, and real-time road simulation.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-512.png',
  },
  applicationName: 'GariKoi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GariKoi',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-white antialiased selection:bg-emerald-600 selection:text-white">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
