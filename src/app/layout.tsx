import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Script from 'next/script';
import { LazyMotion, domAnimation } from 'framer-motion';
import nextDynamic from 'next/dynamic';

const AppSidebar = nextDynamic(() => import('@/components/app-sidebar'), { ssr: false });
const PageHeader = nextDynamic(() => import('@/components/page-header'), { ssr: false });
const AppFooter = nextDynamic(() => import('@/components/app-footer'), { ssr: false });

import { MobileNav } from '@/components/mobile/mobile-nav';
import { ClientOnlyExtras } from '@/components/client-only-extras';
import { headers } from 'next/headers';

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
import { FloatingFeedback } from '@/components/floating-feedback';


export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobileHeader = headersList.get('sec-ch-ua-mobile') === '?1';
  const isMobileUA = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isMobile = isMobileHeader || isMobileUA;

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

        {/* Critical Performance: Preconnect & DNS Prefetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Critical CSS: Prevent white flash and speed up initial paint */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
                --background: 240 10% 3.9%;
                --foreground: 0 0% 98%;
                --primary: 142 70% 45%;
                --radius: 12px;
            }
            * { font-display: swap !important; }
            body { 
                background-color: hsl(240 10% 3.9%); 
                color: hsl(0 0% 98%);
                margin: 0;
                font-family: var(--font-inter), system-ui, sans-serif;
            }
            #mobile-ssr-lcp { 
                opacity: 1 !important; 
                visibility: visible !important; 
                contain-intrinsic-size: 500px;
                content-visibility: auto;
            }
        `}} />
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
                  {isMobile ? (
                    <main className="flex-1 flex flex-col min-h-screen w-full relative">
                      <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                    </main>
                  ) : (
                    <SidebarProviderWrapper>
                      <AppSidebar />
                      <main className="flex-1 flex flex-col min-h-screen w-full relative">
                        <PageHeader />
                        <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                        <AppFooter />
                      </main>
                    </SidebarProviderWrapper>
                  )}
                  <FloatingFeedback />
                </LazyMotion>
              )}
            </SettingsProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>

        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P2725PBH');
          `}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-95Z6VMSH51'}`} strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
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
      </body>
    </html>
  );
}
