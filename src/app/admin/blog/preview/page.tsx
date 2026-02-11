'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function BlogPreviewPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Read preview data from sessionStorage
        const raw = sessionStorage.getItem('blog-preview');
        if (raw) {
            try {
                setData(JSON.parse(raw));
            } catch {
                setData(null);
            }
        }
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">No preview data found. Go back to the editor and click Preview.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Preview Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-600 dark:text-amber-400 text-center py-2 px-4 text-sm font-medium sticky top-0 z-50 backdrop-blur-sm">
                ⚠️ Preview Mode — This is how your post will look when published.
            </div>

            <article className="container max-w-3xl mx-auto py-12 px-4">
                {/* Cover Image */}
                {data.coverImage && (
                    <div className="w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Tags */}
                {data.tags && data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {data.tags.map((tag: string) => (
                            <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-headline">
                    {data.title || 'Untitled Post'}
                </h1>

                {/* Excerpt */}
                {data.excerpt && (
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {data.excerpt}
                    </p>
                )}

                <hr className="mb-8 border-border/50" />

                {/* Content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: data.content || '<p><em>No content yet.</em></p>' }}
                />
            </article>
        </div>
    );
}
