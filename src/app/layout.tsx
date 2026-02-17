import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Script from 'next/script';
import NextDynamic from 'next/dynamic';
import { LazyMotion, domAnimation } from 'framer-motion';

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
import { checkIpLockout } from '@/app/actions/admin';
import { BrutalLockout } from '@/components/brutal-lockout';


export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let lockoutStatus = { isLocked: false, lockedUntil: 0 };

  try {
    const status = await checkIpLockout();
    lockoutStatus = {
      isLocked: status.isLocked || false,
      lockedUntil: status.lockedUntil || 0
    };
  } catch (error) {
    console.error('[RootLayout] IP Lockout check failed:', error);
  }

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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-body antialiased">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P2725PBH"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="gtm"></iframe></noscript>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>
            <SettingsProvider>
              {lockoutStatus.isLocked && lockoutStatus.lockedUntil ? (
                <BrutalLockout lockedUntil={lockoutStatus.lockedUntil} />
              ) : (
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
              )}
            </SettingsProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>

        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P2725PBH');
          `}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-95Z6VMSH51'}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-95Z6VMSH51'}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `}
        </Script>
        <Script src="https://www.google.com/recaptcha/api.js?render=6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF" strategy="lazyOnload" />
      </body>
    </html>
  );
}
