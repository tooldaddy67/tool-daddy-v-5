'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Search, Globe, FileCode, Share2, Loader2,
    CheckCircle2, XCircle, AlertTriangle, ExternalLink, Copy, Eye,
    FileText, Type, List, Save, Download, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { TOOL_CATEGORIES, ALL_TOOLS } from '@/lib/constants';
import { AdminPasswordGate } from '@/components/admin-password-gate';

export default function AdminSeoTools() {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    // Meta Tag Analyzer state
    const [analyzeUrl, setAnalyzeUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [seoData, setSeoData] = useState<any>(null);
    const [seoError, setSeoError] = useState<string | null>(null);

    // OG Preview state
    const [ogUrl, setOgUrl] = useState('');
    const [ogData, setOgData] = useState<any>(null);
    const [ogLoading, setOgLoading] = useState(false);

    // Robots.txt Generator state
    const [robotsContent, setRobotsContent] = useState('User-agent: *\nAllow: /\nSitemap: https://tool-daddy.com/sitemap.xml');

    // Keyword Density state
    const [densityText, setDensityText] = useState('');
    const [keywordDensity, setKeywordDensity] = useState<{ word: string; count: number; density: number }[]>([]);

    const EXTERNAL_SEO_TOOLS = [
        { name: 'Google Search Console', url: 'https://search.google.com/search-console', icon: Search, desc: 'Monitor search performance and indexing.' },
        { name: 'PageSpeed Insights', url: 'https://pagespeed.web.dev/', icon: Globe, desc: 'Analyze page load speed and Core Web Vitals.' },
        { name: 'Rich Results Test', url: 'https://search.google.com/test/rich-results', icon: FileCode, desc: 'Test structured data for rich snippets.' },
        { name: 'Ahrefs Webmaster Tools', url: 'https://ahrefs.com/webmaster-tools', icon: Globe, desc: 'Free site audit and backlink analysis.' },
        { name: 'Moz Domain Analysis', url: 'https://moz.com/domain-analysis', icon: Globe, desc: 'Check domain authority and keywords.' },
        { name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest/', icon: Search, desc: 'Keyword research and site audit.' },
    ];

    const handleAnalyze = async () => {
        if (!analyzeUrl) return;
        setAnalyzing(true);
        setSeoError(null);
        setSeoData(null);
        try {
            const res = await fetch('/api/admin/seo-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: analyzeUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSeoData(data);
        } catch (err: any) {
            setSeoError(err.message || 'Failed to analyze');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleOgPreview = async () => {
        if (!ogUrl) return;
        setOgLoading(true);
        setOgData(null);
        try {
            const res = await fetch('/api/admin/seo-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: ogUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setOgData(data);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setOgLoading(false);
        }
    };

    // Sitemap generation
    const generateSitemap = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tool-daddy.com';
        const now = new Date().toISOString().split('T')[0];

        const staticPages = ['/', '/dashboard', '/blog', '/feedback'];
        const toolPages = ALL_TOOLS.map(t => t.href);
        const allPages = [...staticPages, ...toolPages];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : page.startsWith('/tools') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;
        return xml;
    };

    const [sitemapXml, setSitemapXml] = useState<string | null>(null);

    const handleGenerateSitemap = () => {
        const xml = generateSitemap();
        setSitemapXml(xml);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleKeywordAnalyze = () => {
        if (!densityText) return;
        const words = densityText.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const counts: Record<string, number> = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);

        const result = Object.entries(counts)
            .map(([word, count]) => ({
                word,
                count,
                density: parseFloat(((count / words.length) * 100).toFixed(2))
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        setKeywordDensity(result);
    };

    const downloadSitemap = () => {
        if (!sitemapXml) return;
        const blob = new Blob([sitemapXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isUserLoading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <AdminPasswordGate>
            <div className="container mx-auto p-6 space-y-8 min-h-screen pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">SEO Tools</h1>
                        <p className="text-muted-foreground">Analyze, audit, and optimize your site&apos;s SEO.</p>
                    </div>
                </div>

                {/* Tools Tabs */}
                <Tabs defaultValue="analyzer" className="space-y-6">
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                        <TabsTrigger value="analyzer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Search className="h-4 w-4 mr-2" /> Analyzer
                        </TabsTrigger>
                        <TabsTrigger value="sitemap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <FileCode className="h-4 w-4 mr-2" /> Sitemap
                        </TabsTrigger>
                        <TabsTrigger value="ogpreview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Share2 className="h-4 w-4 mr-2" /> OG Preview
                        </TabsTrigger>
                        <TabsTrigger value="keywords" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Type className="h-4 w-4 mr-2" /> Keywords
                        </TabsTrigger>
                        <TabsTrigger value="robots" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <FileText className="h-4 w-4 mr-2" /> Robots.txt
                        </TabsTrigger>
                        <TabsTrigger value="external" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <ExternalLink className="h-4 w-4 mr-2" /> External
                        </TabsTrigger>
                    </TabsList>

                    {/* ===== META TAG ANALYZER ===== */}
                    <TabsContent value="analyzer" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-primary" />
                                    Meta Tag Analyzer
                                </CardTitle>
                                <CardDescription>
                                    Enter any URL to analyze its SEO meta tags, heading structure, and image alt attributes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com"
                                        value={analyzeUrl}
                                        onChange={(e) => setAnalyzeUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    />
                                    <Button onClick={handleAnalyze} disabled={analyzing || !analyzeUrl}>
                                        {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        <span className="ml-2">Analyze</span>
                                    </Button>
                                </div>

                                {seoError && (
                                    <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                        <XCircle className="h-4 w-4 shrink-0" />
                                        {seoError}
                                    </div>
                                )}

                                {seoData && (
                                    <div className="space-y-6 pt-2">
                                        {/* Basic Meta */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Meta Tags</h3>
                                            <div className="grid gap-3">
                                                <MetaRow
                                                    label="Title"
                                                    value={seoData.title}
                                                    status={seoData.titleLength > 0 && seoData.titleLength <= 60 ? 'good' : seoData.titleLength > 60 ? 'warn' : 'bad'}
                                                    hint={seoData.titleLength ? `${seoData.titleLength}/60 chars` : 'Missing!'}
                                                />
                                                <MetaRow
                                                    label="Description"
                                                    value={seoData.description}
                                                    status={seoData.descriptionLength > 0 && seoData.descriptionLength <= 160 ? 'good' : seoData.descriptionLength > 160 ? 'warn' : 'bad'}
                                                    hint={seoData.descriptionLength ? `${seoData.descriptionLength}/160 chars` : 'Missing!'}
                                                />
                                                <MetaRow label="Canonical" value={seoData.canonical} status={seoData.canonical ? 'good' : 'warn'} />
                                                <MetaRow label="Language" value={seoData.language} status={seoData.language ? 'good' : 'warn'} />
                                                <MetaRow label="Robots" value={seoData.robots || 'Not set (defaults to index, follow)'} status="good" />
                                                <MetaRow label="Keywords" value={seoData.keywords} status={seoData.keywords ? 'good' : 'warn'} hint="Optional" />
                                            </div>
                                        </div>

                                        {/* Page Stats */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Page Structure</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <StatBadge label="H1 Tags" value={seoData.stats.h1Count} good={seoData.stats.h1Count === 1} />
                                                <StatBadge label="H2 Tags" value={seoData.stats.h2Count} good={seoData.stats.h2Count > 0} />
                                                <StatBadge label="H3 Tags" value={seoData.stats.h3Count} good={true} />
                                                <StatBadge label="Total Images" value={seoData.stats.totalImages} good={true} />
                                                <StatBadge label="Images w/ Alt" value={seoData.stats.imagesWithAlt} good={seoData.stats.imagesMissingAlt === 0} />
                                                <StatBadge label="Missing Alt" value={seoData.stats.imagesMissingAlt} good={seoData.stats.imagesMissingAlt === 0} />
                                                <StatBadge label="Internal Links" value={seoData.stats.internalLinks} good={true} />
                                                <StatBadge label="External Links" value={seoData.stats.externalLinks} good={true} />
                                            </div>
                                        </div>

                                        {/* OG Tags */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Open Graph</h3>
                                            <div className="grid gap-3">
                                                <MetaRow label="og:title" value={seoData.og.title} status={seoData.og.title ? 'good' : 'bad'} />
                                                <MetaRow label="og:description" value={seoData.og.description} status={seoData.og.description ? 'good' : 'bad'} />
                                                <MetaRow label="og:image" value={seoData.og.image} status={seoData.og.image ? 'good' : 'bad'} />
                                                <MetaRow label="og:type" value={seoData.og.type} status={seoData.og.type ? 'good' : 'warn'} />
                                                <MetaRow label="og:site_name" value={seoData.og.siteName} status={seoData.og.siteName ? 'good' : 'warn'} />
                                            </div>
                                        </div>

                                        {/* Twitter Card */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Twitter Card</h3>
                                            <div className="grid gap-3">
                                                <MetaRow label="twitter:card" value={seoData.twitter.card} status={seoData.twitter.card ? 'good' : 'warn'} />
                                                <MetaRow label="twitter:title" value={seoData.twitter.title} status={seoData.twitter.title ? 'good' : 'warn'} />
                                                <MetaRow label="twitter:description" value={seoData.twitter.description} status={seoData.twitter.description ? 'good' : 'warn'} />
                                                <MetaRow label="twitter:image" value={seoData.twitter.image} status={seoData.twitter.image ? 'good' : 'warn'} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ===== SITEMAP GENERATOR ===== */}
                    <TabsContent value="sitemap" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-primary" />
                                    Sitemap Generator
                                </CardTitle>
                                <CardDescription>
                                    Auto-generate a sitemap.xml from all {ALL_TOOLS.length} tools and static pages.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button onClick={handleGenerateSitemap}>
                                        <FileCode className="mr-2 h-4 w-4" /> Generate Sitemap
                                    </Button>
                                    {sitemapXml && (
                                        <>
                                            <Button variant="outline" onClick={() => copyToClipboard(sitemapXml)}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy XML
                                            </Button>
                                            <Button variant="outline" onClick={downloadSitemap}>
                                                Download
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p><strong>Pages included:</strong></p>
                                    <p>• {TOOL_CATEGORIES.length} categories with {ALL_TOOLS.length} tools</p>
                                    <p>• Static pages: /, /dashboard, /blog, /feedback</p>
                                </div>

                                {sitemapXml && (
                                    <pre className="bg-muted/50 border rounded-lg p-4 text-xs overflow-auto max-h-[400px] font-mono">
                                        {sitemapXml}
                                    </pre>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ===== OG PREVIEW ===== */}
                    <TabsContent value="ogpreview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Share2 className="h-5 w-5 text-primary" />
                                    Open Graph Preview
                                </CardTitle>
                                <CardDescription>
                                    See how your pages look when shared on social media.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://tool-daddy.com"
                                        value={ogUrl}
                                        onChange={(e) => setOgUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleOgPreview()}
                                    />
                                    <Button onClick={handleOgPreview} disabled={ogLoading || !ogUrl}>
                                        {ogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                        <span className="ml-2">Preview</span>
                                    </Button>
                                </div>

                                {ogData && (
                                    <div className="space-y-6">
                                        {/* Facebook/Generic Preview */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground">Facebook / LinkedIn Preview</h3>
                                            <div className="border rounded-lg overflow-hidden max-w-lg bg-card">
                                                {ogData.og.image && (
                                                    <div className="w-full h-52 bg-muted relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={ogData.og.image}
                                                            alt="OG Preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-3 space-y-1">
                                                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">
                                                        {ogData.og.siteName || new URL(ogData.url).hostname}
                                                    </p>
                                                    <p className="font-semibold text-sm leading-tight">
                                                        {ogData.og.title || ogData.title || 'No title'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {ogData.og.description || ogData.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Twitter Preview */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground">Twitter / X Preview</h3>
                                            <div className="border rounded-xl overflow-hidden max-w-lg bg-card">
                                                {(ogData.twitter.image || ogData.og.image) && (
                                                    <div className="w-full h-52 bg-muted relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={ogData.twitter.image || ogData.og.image}
                                                            alt="Twitter Preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-3 space-y-0.5">
                                                    <p className="font-semibold text-sm leading-tight">
                                                        {ogData.twitter.title || ogData.og.title || ogData.title || 'No title'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {ogData.twitter.description || ogData.og.description || ogData.description || 'No description'}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
                                                        <Globe className="h-3 w-3" />
                                                        {new URL(ogData.url).hostname}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                                            <h3 className="text-sm font-semibold">Social Share Readiness</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <ScoreBadge label="OG Title" ok={!!ogData.og.title} />
                                                <ScoreBadge label="OG Description" ok={!!ogData.og.description} />
                                                <ScoreBadge label="OG Image" ok={!!ogData.og.image} />
                                                <ScoreBadge label="Twitter Card" ok={!!ogData.twitter.card} />
                                                <ScoreBadge label="Twitter Image" ok={!!ogData.twitter.image || !!ogData.og.image} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* ===== KEYWORD DENSITY ===== */}
                    <TabsContent value="keywords" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Type className="h-5 w-5 text-primary" />
                                    Keyword Density Analyzer
                                </CardTitle>
                                <CardDescription>Paste text below to analyze keyword frequency and density.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <textarea
                                    className="w-full h-40 p-3 rounded-lg border bg-background font-sans resize-none focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Paste your content here..."
                                    value={densityText}
                                    onChange={(e) => setDensityText(e.target.value)}
                                />
                                <Button onClick={handleKeywordAnalyze} disabled={!densityText}>
                                    Analyze Keywords
                                </Button>

                                {keywordDensity.length > 0 && (
                                    <div className="pt-4 overflow-hidden rounded-lg border">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Keyword</th>
                                                    <th className="px-4 py-2 font-medium">Count</th>
                                                    <th className="px-4 py-2 font-medium">Density (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {keywordDensity.map((row) => (
                                                    <tr key={row.word} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-2 font-medium">{row.word}</td>
                                                        <td className="px-4 py-2">{row.count}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary" style={{ width: `${Math.min(row.density * 10, 100)}%` }} />
                                                                </div>
                                                                {row.density}%
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ===== ROBOTS.TXT GENERATOR ===== */}
                    <TabsContent value="robots" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Robots.txt Generator
                                </CardTitle>
                                <CardDescription>Generate a standard robots.txt file for your site.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <textarea
                                    className="w-full h-40 p-4 rounded-lg border bg-muted/30 font-mono text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                                    value={robotsContent}
                                    onChange={(e) => setRobotsContent(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={() => copyToClipboard(robotsContent)}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        const blob = new Blob([robotsContent], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'robots.txt';
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ===== EXTERNAL TOOLS ===== */}
                    <TabsContent value="external" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {EXTERNAL_SEO_TOOLS.map((tool) => (
                                <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="group">
                                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <tool.icon className="h-4 w-4 text-primary" />
                                                    {tool.name}
                                                </span>
                                                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground">{tool.desc}</p>
                                        </CardContent>
                                    </Card>
                                </a>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminPasswordGate>
    );
}

// Helper components
function MetaRow({ label, value, status, hint }: { label: string; value: string | null; status: 'good' | 'warn' | 'bad'; hint?: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
            <div className="mt-0.5">
                {status === 'good' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {status === 'warn' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {status === 'bad' && <XCircle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
                </div>
                <p className="text-sm truncate">{value || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
        </div>
    );
}

function StatBadge({ label, value, good }: { label: string; value: number; good: boolean }) {
    return (
        <div className={`p-3 rounded-lg border text-center ${good ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <p className={`text-2xl font-bold ${good ? 'text-green-500' : 'text-red-500'}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
        </div>
    );
}

function ScoreBadge({ label, ok }: { label: string; ok: boolean }) {
    return (
        <Badge variant={ok ? 'default' : 'destructive'} className="text-xs">
            {ok ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
            {label}
        </Badge>
    );
}
