import { getPublishedPosts } from '@/lib/blog-server';
import { BlogCard } from './_components/blog-card';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Tool Daddy',
    description: 'Tutorials, updates, and tips from the Tool Daddy team.',
};

export default async function BlogIndexPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            <div className="text-center space-y-4 mb-16">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                    Tool <span className="text-primary">Daddy</span> Blog
                </h1>
                <p className="mx-auto text-muted-foreground md:text-xl max-w-[700px]">
                    Discover tutorials, updates, and pro-tips to get the most out of our tools.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                    <BlogCard key={post.slug} post={post} index={index} />
                ))}
            </div>
        </div>
    );
}
