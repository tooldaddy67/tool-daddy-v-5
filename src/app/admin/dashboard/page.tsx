'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AnalyticsChart } from '@/components/admin/analytics-chart';
import { StatsCard } from '@/components/admin/stats-card';
import {
    Users, TrendingUp, Hammer, MousePointerClick, MessageSquare,
    Loader2, RefreshCw, AlertTriangle, Globe, Search, FileCode,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminPasswordGate } from '@/components/admin-password-gate';
import Link from 'next/link';

interface AnalyticsData {
    totalUsers: number;
    totalFeedback: number;
    totalExecutions: number;
    activeTools: number;
    topTools: { name: string; usage: number }[];
    dailyActivity: { name: string; active: number }[];
    userGrowth: { name: string; users: number }[];
}

const SEO_TOOLS = [
    {
        name: 'Google Search Console',
        description: 'Monitor search performance, indexing, and fix issues.',
        url: 'https://search.google.com/search-console',
        icon: Search,
    },
    {
        name: 'Google PageSpeed Insights',
        description: 'Analyze page speed and Core Web Vitals scores.',
        url: 'https://pagespeed.web.dev/',
        icon: TrendingUp,
    },
    {
        name: 'Rich Results Test',
        description: 'Validate structured data (JSON-LD) for rich snippets.',
        url: 'https://search.google.com/test/rich-results',
        icon: FileCode,
    },
    {
        name: 'Google Analytics',
        description: 'Track visitors, sessions, bounce rate, and conversions.',
        url: 'https://analytics.google.com/',
        icon: TrendingUp,
    },
    {
        name: 'Moz Domain Analysis',
        description: 'Check domain authority, ranking keywords, and competitors.',
        url: 'https://moz.com/domain-analysis',
        icon: Globe,
    },
    {
        name: 'Ubersuggest',
        description: 'Advanced keyword research and SEO site audit tool.',
        url: 'https://neilpatel.com/ubersuggest/',
        icon: Search,
    },
    {
        name: 'GTmetrix',
        description: 'Detailed analysis of page load performance and waterfalls.',
        url: 'https://gtmetrix.com/',
        icon: TrendingUp,
    },
    {
        name: 'Schema Markup Validator',
        description: 'Validate structured data against Schema.org specs.',
        url: 'https://validator.schema.org/',
        icon: FileCode,
    },
];

export default function AdminDashboard() {
    const { user, auth, isUserLoading } = useFirebase();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!user || !auth || user.isAnonymous) return;

        setLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                if (res.status === 403) {
                    throw new Error(errData.message || errData.error || 'Forbidden: You do not have admin access.');
                }
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const analyticsData = await res.json();
            setData(analyticsData);
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [user, auth]);

    useEffect(() => {
        if (!isUserLoading && (!user || user.isAnonymous)) {
            router.push('/');
            return;
        }
        if (user && !user.isAnonymous) {
            fetchAnalytics();
        }
    }, [user, isUserLoading, router, fetchAnalytics]);

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Real-time platform analytics from Firestore.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/feedback">
                            <Button variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" /> View Feedback
                            </Button>
                        </Link>
                        <Link href="/admin/seo-tools">
                            <Button variant="outline">
                                <Globe className="mr-2 h-4 w-4" /> SEO Tools
                            </Button>
                        </Link>
                        <Link href="/admin/blog">
                            <Button variant="outline">Manage Blog</Button>
                        </Link>
                        <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-medium">Failed to load analytics</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" onClick={fetchAnalytics}>Retry</Button>
                    </div>
                )}

                {/* Loading State */}
                {loading && !data && (
                    <div className="flex h-[40vh] items-center justify-center">
                        <div className="text-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Aggregating analytics from Firestore...</p>
                        </div>
                    </div>
                )}

                {/* Data */}
                {data && (
                    <>
                        {/* Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                title="Total Users"
                                value={data.totalUsers.toLocaleString()}
                                icon={Users}
                                description="Registered accounts"
                            />
                            <StatsCard
                                title="Active Tools"
                                value={data.activeTools.toString()}
                                icon={Hammer}
                                description="Tools used in the last 7 days"
                            />
                            <StatsCard
                                title="Total Executions"
                                value={data.totalExecutions.toLocaleString()}
                                icon={MousePointerClick}
                                description="Tool runs in the last 7 days"
                            />
                            <StatsCard
                                title="Feedback Items"
                                value={data.totalFeedback.toString()}
                                icon={MessageSquare}
                                description="Bug reports & suggestions"
                            />
                        </div>

                        {/* Main Charts */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <AnalyticsChart
                                    title="User Growth (Estimated)"
                                    description="Registration trend over the last 7 months"
                                    data={data.userGrowth}
                                    dataKey="users"
                                    type="area"
                                    height={350}
                                />
                            </div>
                            <div className="col-span-3">
                                <AnalyticsChart
                                    title="Top Tools (Last 7 Days)"
                                    description="Most used tools by execution count"
                                    data={data.topTools}
                                    dataKey="usage"
                                    type="bar"
                                    height={350}
                                    color="hsl(var(--primary))"
                                />
                            </div>
                        </div>

                        {/* Secondary Charts */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <AnalyticsChart
                                    title="Daily Active Users (Last 7 Days)"
                                    description="Unique users per day"
                                    data={data.dailyActivity}
                                    dataKey="active"
                                    type="bar"
                                    height={300}
                                    color="hsl(var(--accent))"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* SEO Tools Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            SEO Tools
                        </h2>
                        <p className="text-muted-foreground">Quick access to essential SEO and performance tools.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {SEO_TOOLS.map((tool) => (
                            <a
                                key={tool.name}
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <tool.icon className="h-4 w-4 text-primary" />
                                                {tool.name}
                                            </span>
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                                    </CardContent>
                                </Card>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </AdminPasswordGate>
    );
}
