import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        const response = await fetch(parsedUrl.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ToolDaddy SEO Bot/1.0)',
                'Accept': 'text/html',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch: HTTP ${response.status}` }, { status: 502 });
        }

        const html = await response.text();

        // Parse meta tags from HTML
        const getMetaContent = (name: string): string | null => {
            // Check name attribute
            const nameMatch = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i'));
            if (nameMatch) return nameMatch[1];

            // Check property attribute (for OG tags)
            const propMatch = html.match(new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${name}["']`, 'i'));
            if (propMatch) return propMatch[1];

            return null;
        };

        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
        const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*)["']/i);
        const langMatch = html.match(/<html[^>]+lang=["']([^"']*)["']/i);

        // Count headings
        const h1s = (html.match(/<h1[^>]*>/gi) || []).length;
        const h2s = (html.match(/<h2[^>]*>/gi) || []).length;
        const h3s = (html.match(/<h3[^>]*>/gi) || []).length;

        // Count images and alt tags
        const images = (html.match(/<img[^>]*>/gi) || []);
        const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length;

        // Count internal/external links
        const links = (html.match(/<a[^>]+href=["']([^"']*)["']/gi) || []);
        const internalLinks = links.filter(l => {
            const href = l.match(/href=["']([^"']*)["']/i)?.[1] || '';
            return href.startsWith('/') || href.includes(parsedUrl.hostname);
        }).length;

        const result = {
            url: parsedUrl.toString(),
            title: titleMatch?.[1]?.trim() || null,
            titleLength: titleMatch?.[1]?.trim().length || 0,
            description: getMetaContent('description'),
            descriptionLength: getMetaContent('description')?.length || 0,
            canonical: canonicalMatch?.[1] || null,
            favicon: faviconMatch?.[1] || null,
            language: langMatch?.[1] || null,
            robots: getMetaContent('robots'),
            keywords: getMetaContent('keywords'),
            // Open Graph
            og: {
                title: getMetaContent('og:title'),
                description: getMetaContent('og:description'),
                image: getMetaContent('og:image'),
                url: getMetaContent('og:url'),
                type: getMetaContent('og:type'),
                siteName: getMetaContent('og:site_name'),
            },
            // Twitter Card
            twitter: {
                card: getMetaContent('twitter:card'),
                title: getMetaContent('twitter:title'),
                description: getMetaContent('twitter:description'),
                image: getMetaContent('twitter:image'),
                site: getMetaContent('twitter:site'),
            },
            // Page stats
            stats: {
                h1Count: h1s,
                h2Count: h2s,
                h3Count: h3s,
                totalImages: images.length,
                imagesWithAlt,
                imagesMissingAlt: images.length - imagesWithAlt,
                totalLinks: links.length,
                internalLinks,
                externalLinks: links.length - internalLinks,
            },
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Meta tag fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze URL' },
            { status: 500 }
        );
    }
}
