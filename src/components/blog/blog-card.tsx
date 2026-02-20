import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils'; // Assuming this exists or I'll use standard Date
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface BlogCardProps {
    title: string;
    brief: string;
    slug: string;
    coverImage?: {
        url: string;
    };
    publishedAt: string;
}

export function BlogCard({ title, brief, slug, coverImage, publishedAt }: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`} className="group block h-full">
            <Card className="h-full overflow-hidden border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all duration-300 flex flex-col">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {coverImage ? (
                        <Image
                            src={coverImage.url}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold">
                            Tool Daddy Blog
                        </div>
                    )}
                </div>
                <CardHeader className="p-4 sm:p-6 pb-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                        {new Date(publishedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                    <h2 className="text-xl font-bold font-headline group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                    </h2>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {brief}
                    </p>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0 mt-auto border-t border-border/10">
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Read Article <ArrowRight className="w-4 h-4" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
