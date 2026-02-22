import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';

// Static optimization enabled by removing force-dynamic

import Script from 'next/script';
import NextDynamic from 'next/dynamic';
import { LazyMotion, domAnimation } from 'framer-motion';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';

import PageHeader from '@/components/page-header';
import { ClientOnlyExtras } from '@/components/client-only-extras';

const AppSidebar = NextDynamic(() => import('@/components/app-sidebar'));
const AppFooter = NextDynamic(() => import('@/components/app-footer'));
const MobileNav = NextDynamic(() => import('@/components/mobile/mobile-nav').then(mod => mod.MobileNav));

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Tool Daddy - Your Ultimate Suite of Online Tools',
  description: 'Your complete suite for media manipulation. Convert, download, enhance, and more. All in one place.',
  keywords: ['image converter', 'video converter', 'online tools', 'image compressor', 'QR code generator', 'metadata extractor', 'audio converter', 'file converter', 'free online tools'],
  authors: [{ name: 'Tool Daddy Team' }],
  creator: 'Tool Daddy',
  publisher: 'Tool Daddy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com',
    siteName: 'Tool Daddy',
    title: 'Tool Daddy - Your Ultimate Suite of Online Tools',
    description: 'Your complete suite for media manipulation. Convert, download, enhance, and more.',
    images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com'}/og-image.png`, width: 1200, height: 630, alt: 'Tool Daddy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Daddy - Your Ultimate Suite of Online Tools',
    description: 'Your complete suite for media manipulation.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com'}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

import { SettingsProvider } from '@/components/settings-provider';
import { SidebarProviderWrapper } from '@/components/sidebar-provider-wrapper';
// Lockout logic removed



export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Lockout logic removed

  return (
    <html lang="en" suppressHydrationWarning className={cn(
      inter.variable,
      spaceGrotesk.variable,
      playfair.variable
    )}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-body antialiased">

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>
            <SettingsProvider>
              <LazyMotion features={domAnimation}>
                <ClientOnlyExtras />
                <SidebarProviderWrapper>
                  <AppSidebar />
                  <main className="flex-1 flex flex-col min-h-screen w-full relative">
                    <PageHeader />
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                          '@context': 'https://schema.org',
                          '@type': 'WebSite',
                          name: 'Tool Daddy',
                          description: 'The ultimate free online tool suite. Image compression, video conversion, AI tools, and more.',
                          url: process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com',
                          potentialAction: {
                            '@type': 'SearchAction',
                            target: {
                              '@type': 'EntryPoint',
                              urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com'}/?q={search_term_string}`,
                            },
                            'query-input': 'required name=search_term_string',
                          },
                        })
                      }}
                    />
                    <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                    <AppFooter />
                    <MobileNav />
                  </main>
                </SidebarProviderWrapper>
              </LazyMotion>
            </SettingsProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>

        <GoogleTagManager gtmId="GTM-P2725PBH" />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-95Z6VMSH51'} />
        <Script src="https://www.google.com/recaptcha/api.js?render=6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF" strategy="lazyOnload" />
      </body>
    </html>
  );
}
