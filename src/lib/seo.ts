import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com';

export function constructMetadata({
    title = 'Tool Daddy - Your Ultimate Suite of Online Tools',
    description = 'Your complete suite for media manipulation. Convert, download, enhance, and more. All in one place.',
    image = '/og-image.png',
    icons = '/favicon.ico',
    noIndex = false,
    canonical = '',
    keywords = [],
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: string;
    noIndex?: boolean;
    canonical?: string;
    keywords?: string[];
} = {}): Metadata {
    const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    return {
        title,
        description,
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
            ...keywords
        ],
        authors: [{ name: 'Tool Daddy Team' }],
        creator: 'Tool Daddy',
        publisher: 'Tool Daddy',
        metadataBase: new URL(BASE_URL),
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url,
            siteName: 'Tool Daddy',
            title,
            description,
            images: [
                {
                    url: image.startsWith('http') ? image : `${BASE_URL}${image}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image.startsWith('http') ? image : `${BASE_URL}${image}`],
            creator: '@tooldaddy',
        },
        icons,
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
