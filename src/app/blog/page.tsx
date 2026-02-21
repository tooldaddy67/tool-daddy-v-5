import { getAllPosts } from '@/lib/hashnode';
import { BlogCard } from '@/components/blog/blog-card';
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tool Daddy Blog - Tips, Tutorials, & Tech Insights',
    description: 'Read the latest articles about web development, productivity tools, and tech tutorials from Tool Daddy.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
    try {
        const posts = await getAllPosts();

        return (
            <div className="container py-12 px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Tool Daddy Blog
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Discover tips, tutorials, and insights to supercharge your workflow.
                    </p>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {posts.map((post) => (
                            <BlogCard
                                key={post.id}
                                title={post.title}
                                brief={post.brief}
                                slug={post.slug}
                                coverImage={post.coverImage}
                                publishedAt={post.publishedAt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-white/10 bg-white/5">
                        <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">No Articles Yet</h2>
                        <p className="text-muted-foreground max-w-md">
                            We haven't published any articles yet. Check back soon for updates!
                        </p>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error in BlogPage:', error);
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Error loading blog</h2>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }
}
