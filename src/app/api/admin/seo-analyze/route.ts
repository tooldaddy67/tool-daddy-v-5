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

        // Extract all hrefs from <a> tags
        const allLinks = (html.match(/<a[^>]+href=["']([^"']*)["']/gi) || [])
            .map(tag => tag.match(/href=["']([^"']*)["']/i)?.[1])
            .filter((href): href is string => !!href && !href.startsWith('#') && !href.startsWith('javascript:'));

        const internalLinks: string[] = [];
        const externalLinks: string[] = [];

        allLinks.forEach(l => {
            try {
                const linkUrl = new URL(l, parsedUrl); // Resolve relative URLs
                if (linkUrl.hostname === parsedUrl.hostname) {
                    internalLinks.push(linkUrl.toString());
                } else {
                    externalLinks.push(linkUrl.toString());
                }
            } catch (e) {
                // Malformed URL, treat as external or ignore
                externalLinks.push(l);
            }
        });

        // Simple broken link detection (Limit to 5 external for performance)
        const brokenLinks: string[] = [];
        const linksToTest = externalLinks.slice(0, 5); // Test only a few external links

        await Promise.all(linksToTest.map(async (l) => {
            try {
                const head = await fetch(l, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(3000)
                });
                if (!head.ok) brokenLinks.push(l);
            } catch (e) {
                brokenLinks.push(l);
            }
        }));

        const title = titleMatch?.[1]?.trim() || null;
        const description = getMetaContent('description');
        const canonical = canonicalMatch?.[1] || null;
        const language = langMatch?.[1] || null;
        const robots = getMetaContent('robots');
        const keywords = getMetaContent('keywords');

        const ogTitle = getMetaContent('og:title');
        const ogDescription = getMetaContent('og:description');
        const ogImage = getMetaContent('og:image');
        const ogUrl = getMetaContent('og:url');
        const ogType = getMetaContent('og:type');
        const ogSiteName = getMetaContent('og:site_name');

        const twitterCard = getMetaContent('twitter:card');
        const twitterTitle = getMetaContent('twitter:title');
        const twitterDescription = getMetaContent('twitter:description');
        const twitterImage = getMetaContent('twitter:image');
        const twitterSite = getMetaContent('twitter:site');

        return NextResponse.json({
            url: parsedUrl.toString(),
            title: title || '',
            titleLength: title?.length || 0,
            description: description || '',
            descriptionLength: description?.length || 0,
            canonical,
            favicon: faviconMatch?.[1] || null,
            language,
            robots,
            keywords,
            og: {
                title: ogTitle || '',
                description: ogDescription || '',
                image: ogImage || '',
                url: ogUrl || '',
                type: ogType || '',
                siteName: ogSiteName || '',
            },
            twitter: {
                card: twitterCard || '',
                title: twitterTitle || '',
                description: twitterDescription || '',
                image: twitterImage || '',
                site: twitterSite || '',
            },
            stats: {
                h1Count: h1s,
                h2Count: h2s,
                h3Count: h3s,
                totalImages: images.length,
                imagesWithAlt,
                imagesMissingAlt: images.length - imagesWithAlt,
                totalLinks: allLinks.length,
                internalLinks: internalLinks.length,
                externalLinks: externalLinks.length,
                brokenLinksCount: brokenLinks.length,
                brokenLinkUrls: brokenLinks
            },
        });
    } catch (error: any) {
        console.error('Meta tag fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze URL' },
            { status: 500 }
        );
    }
}
