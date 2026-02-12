import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter, Space_Grotesk, Outfit, Plus_Jakarta_Sans, Quicksand, Nunito, Playfair_Display, Lora, Syne, JetBrains_Mono, Roboto_Mono, Fredoka, Cinzel, EB_Garamond } from 'next/font/google';
import AppFooter from '@/components/app-footer';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { LazyMotion, domAnimation } from 'framer-motion';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), {
  ssr: false,
  loading: () => <div className="w-[60px] md:w-[18rem] min-h-screen bg-sidebar border-r border-border/20" />
});

const PageHeader = dynamic(() => import('@/components/page-header'), {
  ssr: false,
  loading: () => <div className="h-16 w-full border-b border-border/20" />
});

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

// Non-default fonts: preload: false to avoid blocking initial render
const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit', preload: false });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-plus-jakarta-sans', preload: false });
const quicksand = Quicksand({ subsets: ['latin'], display: 'swap', variable: '--font-quicksand', preload: false });
const nunito = Nunito({ subsets: ['latin'], display: 'swap', variable: '--font-nunito', preload: false });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair-display', preload: false });
const lora = Lora({ subsets: ['latin'], display: 'swap', variable: '--font-lora', preload: false });
const syne = Syne({ subsets: ['latin'], display: 'swap', variable: '--font-syne', preload: false });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains-mono', preload: false });
const robotoMono = Roboto_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-roboto-mono', preload: false });
const fredoka = Fredoka({ subsets: ['latin'], display: 'swap', variable: '--font-fredoka', preload: false });
const cinzel = Cinzel({ subsets: ['latin'], display: 'swap', variable: '--font-cinzel', preload: false });
const ebGaramond = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-eb-garamond', preload: false });

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

import { SettingsProvider } from '@/components/settings-provider';
import { SidebarProviderWrapper } from '@/components/sidebar-provider-wrapper';
import { ClientOnlyExtras } from '@/components/client-only-extras';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      inter.variable,
      spaceGrotesk.variable,
      outfit.variable,
      plusJakartaSans.variable,
      quicksand.variable,
      nunito.variable,
      playfairDisplay.variable,
      lora.variable,
      syne.variable,
      jetbrainsMono.variable,
      robotoMono.variable,
      fredoka.variable,
      cinzel.variable,
      ebGaramond.variable
    )}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-body antialiased">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P2725PBH"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="gtm"></iframe></noscript>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>
            <SettingsProvider>
              <LazyMotion features={domAnimation}>
                <ClientOnlyExtras />
                <SidebarProviderWrapper>
                  <div className="flex w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-h-screen">
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
                      <div className="flex-1">{children}</div>
                      <AppFooter />
                    </main>
                  </div>
                </SidebarProviderWrapper>
              </LazyMotion>
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
        <Script src="https://www.google.com/recaptcha/api.js?render=6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF" strategy="lazyOnload" />
      </body>
    </html>
  );
}
