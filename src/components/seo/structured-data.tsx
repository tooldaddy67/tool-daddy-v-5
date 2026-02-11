/**
 * Structured Data (JSON-LD) components for SEO.
 * These render <script type="application/ld+json"> tags in the page head.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com';

interface ToolStructuredDataProps {
    name: string;
    description: string;
    url: string;
    category?: string;
}

/**
 * Renders SoftwareApplication JSON-LD for a tool page.
 * This helps Google understand the page is a web-based tool.
 */
export function ToolStructuredData({ name, description, url, category }: ToolStructuredDataProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${name} - Tool Daddy`,
        description,
        url: `${BASE_URL}${url}`,
        applicationCategory: category || 'UtilitiesApplication',
        operatingSystem: 'Web Browser',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        creator: {
            '@type': 'Organization',
            name: 'Tool Daddy',
            url: BASE_URL,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface WebsiteStructuredDataProps {
    name?: string;
    description?: string;
}

/**
 * Renders WebSite JSON-LD for the homepage.
 */
export function WebsiteStructuredData({
    name = 'Tool Daddy',
    description = 'The ultimate free online tool suite. Image compression, video conversion, AI tools, and more.'
}: WebsiteStructuredDataProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        description,
        url: BASE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface BreadcrumbStructuredDataProps {
    items: { name: string; url: string }[];
}

/**
 * Renders BreadcrumbList JSON-LD for navigation hierarchy.
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
