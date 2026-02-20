import { getPostBySlug } from '@/lib/hashnode';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { ToolCTA } from '@/components/blog/tool-cta';
import { Button } from '@/components/ui/button';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found | Tool Daddy' };

    return {
        title: `${post.title} | Tool Daddy Blog`,
        description: post.seo?.description || post.brief,
        openGraph: {
            title: post.title,
            description: post.seo?.description || post.brief,
            images: post.coverImage ? [post.coverImage.url] : [],
            type: 'article',
            publishedTime: post.publishedAt,
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { title, content, coverImage, publishedAt } = post;

    // Estimate read time (assuming ~200 words per minute)
    const wordCount = content?.html ? content.html.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <div className="container max-w-4xl py-12 px-4 md:px-6">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blog
            </Link>

            <article className="prose prose-invert prose-lg max-w-none">
                <header className="mb-10 not-prose">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(publishedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {readTime} min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6 leading-tight">
                        {title}
                    </h1>

                    {coverImage && (
                        <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 mb-8">
                            <Image
                                src={coverImage.url}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* Blog Content */}
                <div
                    className="blog-content prose-headings:font-headline prose-a:text-primary prose-img:rounded-xl prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50"
                    dangerouslySetInnerHTML={{ __html: content?.html || '' }}
                />

                <div className="mt-16 pt-8 border-t border-border/50">
                    <ToolCTA />
                </div>
            </article>

            <div className="mt-12 flex justify-center">
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/blog">
                        <ArrowLeft className="w-4 h-4" /> Read More Articles
                    </Link>
                </Button>
            </div>
        </div>
    );
}
