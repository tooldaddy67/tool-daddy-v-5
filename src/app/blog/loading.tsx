import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

export default function Loading() {
    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12 animate-pulse">
                <div className="p-3 rounded-full bg-muted text-muted-foreground/50">
                    <BookOpen className="w-8 h-8" />
                </div>
                <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
                <Skeleton className="h-6 w-48 md:w-64 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-full border rounded-xl overflow-hidden bg-muted/10 border-border/50">
                        <Skeleton className="aspect-video w-full rounded-none" />
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-2/3" />
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="h-4 w-24 pt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
