import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Anek_Bangla, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { Preloader } from '@/components/Preloader';
import { ChatWidget } from '@/components/chat/ChatWidget';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const anekBangla = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  weight: ['500', '700', '800'],
  variable: '--font-anek',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B6E73',
};

export const metadata: Metadata = {
  title: 'Dr. Fahim Foysal Kollol — General, Laparoscopic, Breast & Colorectal Surgeon',
  description:
    'Dr. Fahim Foysal Kollol — MBBS, BCS (Health), FCPS (Surgery), MACS (USA). Assistant Professor of Surgery, MMCH. Expert surgical care in Sherpur & Mymensingh for piles, fistula, fissure, gallstones, hernia, breast lumps, and laparoscopy.',
  keywords: [
    'Dr Fahim Foysal Kollol',
    'Surgeon Sherpur',
    'Surgeon Mymensingh',
    'Laparoscopic Surgeon',
    'Piles Surgery',
    'Fistula Surgery',
    'Longo Surgery',
    'Gallbladder Stones Laparoscopy',
    'Breast Lump Surgery',
    'পাইলস সার্জন শেরপুর',
    'ল্যাপারোস্কপিক সার্জন ময়মনসিংহ',
  ],
  authors: [{ name: 'Dr. Fahim Foysal Kollol' }],
  metadataBase: new URL('https://drkollol.com'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Dr. Fahim Foysal Kollol — Specialist Surgeon',
    description:
      'General, Laparoscopic, Breast & Colorectal Surgeon in Sherpur and Mymensingh. Book a serial: 01750-529252.',
    url: 'https://drkollol.com',
    siteName: 'Dr. Kollol Surgery Practice',
    images: [
      {
        url: '/img/doctor-v3.webp',
        width: 624,
        height: 1126,
        alt: 'Dr. Fahim Foysal Kollol',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${anekBangla.variable} ${hindSiliguri.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@500;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <Preloader />
          {children}
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
