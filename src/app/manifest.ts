import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Tool Daddy — Free Online Tools',
        short_name: 'Tool Daddy',
        description:
            'Free online tools for images, PDFs, text, colors, and more. No signup needed, works right in your browser.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#7c3aed',
        orientation: 'portrait-primary',
        categories: ['utilities', 'productivity', 'developer'],
        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
