import { getPostBySlug, getPublishedPosts } from '@/lib/blog-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} - Tool Daddy Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.createdAt, // CreatedAt is ISO string from server
            authors: [post.author?.displayName || 'Tool Daddy'],
            images: post.coverImage ? [post.coverImage] : [],
        }
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
            <Link href="/blog">
                <Button variant="ghost" className="mb-8 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Button>
            </Link>

            <header className="mb-12 space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm capitalize px-3 py-1">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-headline text-balance">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm md:text-base border-y border-border/40 py-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{post.author?.displayName || 'Tool Daddy Team'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.createdAt}>
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}
                        </time>
                    </div>
                </div>
            </header>

            {post.coverImage && (
                <div className="relative w-full aspect-video mb-12 rounded-xl overflow-hidden border border-border/20 shadow-xl">
                    {/* Using generic img tag if Image component fails setup, or assume paths are correct */}
                    <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
                        {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                            'No Cover Image'
                        )}
                    </div>
                    {/* 
                <Image 
                    src={post.coverImage} 
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
             */}
                </div>
            )}

            <div
                className="prose prose-lg dark:prose-invert prose-headings:font-headline prose-a:text-primary prose-img:rounded-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    );
}
