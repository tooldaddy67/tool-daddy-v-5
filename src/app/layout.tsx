
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import PageHeader from '@/components/page-header';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useEnforceMfaForUnstablegng } from '@/hooks/use-enforce-mfa';
import { Inter, Space_Grotesk, Outfit, Plus_Jakarta_Sans, Quicksand, Nunito, Playfair_Display, Lora, Syne, JetBrains_Mono, Roboto_Mono, Fredoka, Cinzel, EB_Garamond } from 'next/font/google';
import AppFooter from '@/components/app-footer';
import Script from 'next/script';

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

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
});

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-eb-garamond',
});


export const metadata: Metadata = {
  title: 'Tool Daddy - Your Ultimate Suite of Online Tools',
  description:
    'Your complete suite for media manipulation. Convert, download, enhance, and more. All in one place.',
  keywords: [
    'image converter',
    'video converter',
    'online tools',
    'image compressor',
    'QR code generator',
    'metadata extractor',
    'audio converter',
    'file converter',
    'free online tools',
  ],
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
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Tool Daddy',
      },
    ],
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
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

import { SettingsProvider } from '@/components/settings-provider';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Enforce MFA for unstablegng role
  if (typeof window !== 'undefined') {
    // Only run on client
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEnforceMfaForUnstablegng();
  }
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
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P2725PBH"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SettingsProvider>
              <SidebarProvider>
                <div className="flex w-full">
                  <AppSidebar />
                  <main className="flex-1 flex flex-col min-h-screen">
                    <PageHeader />
                    <div className="flex-1">{children}</div>
                    <AppFooter />
                  </main>
                </div>
              </SidebarProvider>
            </SettingsProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P2725PBH');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-95Z6VMSH51`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-95Z6VMSH51', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `}
        </Script>
        {/* End Google Analytics 4 */}

        {/* Google reCAPTCHA v3 */}
        <Script
          src="https://www.google.com/recaptcha/api.js?render=6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF"
          strategy="afterInteractive"
        />
        {/* End Google reCAPTCHA v3 */}
      </body>
    </html>
  );
}
