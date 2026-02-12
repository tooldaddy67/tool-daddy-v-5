'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { getAllPostsAdmin, deletePost } from '@/lib/blog-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AdminPasswordGate } from '@/components/admin-password-gate';

export default function AdminBlogDashboard() {
    const { user } = useFirebase();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const data = await getAllPostsAdmin();
            setPosts(data);
        } catch (error) {
            console.error('Failed to load posts:', error);
            toast({
                title: 'Access Denied',
                description: 'You do not have permission to view this page or create posts.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadPosts();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
            toast({ title: 'Post deleted' });
        } catch (error) {
            toast({ title: 'Error deleting post', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AdminPasswordGate>
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Blog Dashboard</h1>
                        <p className="text-muted-foreground">Manage your blog posts.</p>
                    </div>
                    <Link href="/admin/blog/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Post
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Posts</CardTitle>
                        <CardDescription>
                            {posts.length} posts found.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : post.status === 'scheduled'
                                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                {post.status === 'scheduled' && post.scheduledAt ? (
                                                    <span className="text-blue-400 font-medium">Drops: {post.scheduledAt.toDate().toLocaleDateString()}</span>
                                                ) : (
                                                    <span>{post.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/blog/${post.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {posts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No posts found. Create your first one!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminPasswordGate>
    );
}
