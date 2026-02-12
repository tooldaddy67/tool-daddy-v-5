'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOAnalyzerProps {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    focusKeyword: string;
}

export function SEOAnalyzer({ title, slug, excerpt, content, focusKeyword }: SEOAnalyzerProps) {
    const analysis = useMemo(() => {
        const checks = [];
        let score = 0;
        const totalWeight = 100;

        const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase();
        const cleanTitle = title.toLowerCase();
        const cleanSlug = slug.toLowerCase();
        const keyword = focusKeyword.toLowerCase().trim();

        // 1. Title Length (10 points)
        const titleLen = title.length;
        if (titleLen >= 40 && titleLen <= 60) {
            checks.push({ label: 'Title length is perfect (40-60 chars)', status: 'good' });
            score += 10;
        } else if (titleLen > 0) {
            checks.push({ label: 'Title is too short or too long', status: 'warn' });
            score += 5;
        } else {
            checks.push({ label: 'Title is missing', status: 'bad' });
        }

        // 2. Focus Keyword in Title (15 points)
        if (keyword && cleanTitle.includes(keyword)) {
            checks.push({ label: 'Focus keyword found in title', status: 'good' });
            score += 15;
        } else if (keyword) {
            checks.push({ label: 'Focus keyword not in title', status: 'bad' });
        }

        // 3. Focus Keyword in Slug (10 points)
        if (keyword && cleanSlug.includes(keyword.replace(/\s+/g, '-'))) {
            checks.push({ label: 'Focus keyword found in slug', status: 'good' });
            score += 10;
        } else if (keyword) {
            checks.push({ label: 'Focus keyword not in slug', status: 'bad' });
        }

        // 4. Focus Keyword in First Paragraph (10 points)
        const firstPara = cleanContent.slice(0, 500);
        if (keyword && firstPara.includes(keyword)) {
            checks.push({ label: 'Focus keyword in first paragraph', status: 'good' });
            score += 10;
        } else if (keyword) {
            checks.push({ label: 'Focus keyword not in first paragraph', status: 'bad' });
        }

        // 5. Excerpt Length (10 points)
        const excerptLen = excerpt.length;
        if (excerptLen >= 120 && excerptLen <= 160) {
            checks.push({ label: 'Excerpt length is perfect (120-160 chars)', status: 'good' });
            score += 10;
        } else if (excerptLen > 0) {
            checks.push({ label: 'Excerpt should be between 120-160 chars', status: 'warn' });
            score += 5;
        } else {
            checks.push({ label: 'Excerpt is missing', status: 'bad' });
        }

        // 6. Content Length (15 points)
        const words = cleanContent.trim() ? cleanContent.split(/\s+/).length : 0;
        if (words >= 600) {
            checks.push({ label: 'Great content length (600+ words)', status: 'good' });
            score += 15;
        } else if (words >= 300) {
            checks.push({ label: 'Good content length (300+ words)', status: 'good' });
            score += 10;
        } else {
            checks.push({ label: 'Content is too thin (below 300 words)', status: 'bad' });
        }

        // 7. Keyword Density (10 points)
        if (keyword && words > 0) {
            const matches = (cleanContent.match(new RegExp(keyword, 'g')) || []).length;
            const density = (matches / words) * 100;
            if (density >= 0.5 && density <= 2.5) {
                checks.push({ label: `Keyword density is perfect (${density.toFixed(2)}%)`, status: 'good' });
                score += 10;
            } else if (density > 2.5) {
                checks.push({ label: 'Keyword density is too high (keyword stuffing)', status: 'warn' });
                score += 5;
            } else if (density > 0) {
                checks.push({ label: 'Keyword density is low', status: 'warn' });
                score += 5;
            } else {
                checks.push({ label: 'Keyword not found in content', status: 'bad' });
            }
        }

        // 8. Headings (10 points)
        const h2Count = (content.match(/<h2/g) || []).length;
        const h3Count = (content.match(/<h3/g) || []).length;
        if (h2Count > 0 || h3Count > 0) {
            checks.push({ label: 'Proper use of subheadings (H2, H3)', status: 'good' });
            score += 10;
        } else {
            checks.push({ label: 'Missing subheadings', status: 'bad' });
        }

        // 9. Links (10 points)
        const linksCount = (content.match(/<a/g) || []).length;
        if (linksCount >= 2) {
            checks.push({ label: 'Internal/External links present', status: 'good' });
            score += 10;
        } else if (linksCount === 1) {
            checks.push({ label: 'Add more links', status: 'warn' });
            score += 5;
        } else {
            checks.push({ label: 'No links found', status: 'bad' });
        }

        return { score, checks };
    }, [title, slug, excerpt, content, focusKeyword]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <Card className="border-primary/20 shadow-xl glow-card overflow-hidden">
            <CardHeader className="pb-2 bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        SEO Content Analyzer
                    </span>
                    <span className={cn("text-2xl font-black italic", getScoreColor(analysis.score))}>
                        {analysis.score}/100
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <span>SEO SCORE</span>
                        <span>{analysis.score}%</span>
                    </div>
                    <Progress value={analysis.score} className="h-2" />
                </div>

                <div className="space-y-2">
                    {analysis.checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 border border-border/50 text-xs transition-all hover:bg-muted/50">
                            <div className="mt-0.5 shrink-0">
                                {check.status === 'good' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                {check.status === 'warn' && <AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                                {check.status === 'bad' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                            </div>
                            <span className={cn(
                                "flex-1",
                                check.status === 'bad' && "text-red-400 font-medium",
                                check.status === 'warn' && "text-orange-400",
                                check.status === 'good' && "text-muted-foreground"
                            )}>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>

                {!focusKeyword && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium text-center">
                        Set a Focus Keyword to get a precise score!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
