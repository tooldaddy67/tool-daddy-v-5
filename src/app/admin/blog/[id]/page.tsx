'use client';

import { useEffect, useState, use } from 'react';
import { useFirebase } from '@/firebase';
import { getPostById, createPost, updatePost, uploadImage, BlogPostInput } from '@/lib/blog-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Loader2, ArrowLeft, Image as ImageIcon, Globe, Hash, Eye,
    Send, FileText, Calendar, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AdminPasswordGate } from '@/components/admin-password-gate';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface BlogPostEditorProps {
    params: Promise<{
        id: string;
    }>;
}

export default function BlogPostEditor({ params }: BlogPostEditorProps) {
    const { id } = use(params);

    const isNew = id === 'new';
    const { user } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<BlogPostInput>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        published: false,
        tags: [],
        coverImage: '',
        status: 'draft',
        scheduledAt: null,
    });
    const [tagsInput, setTagsInput] = useState('');
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    // Word/char count from content
    const contentStats = (() => {
        const text = (formData.content || '').replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        return { words, chars };
    })();

    const loadPost = async () => {
        try {
            const post = await getPostById(id);
            if (post) {
                setFormData(post as Partial<BlogPostInput>);
                // Populate tags input
                if ((post as any).tags) {
                    setTagsInput((post as any).tags.join(', '));
                }
            } else {
                toast({ title: 'Post not found', variant: 'destructive' });
                router.push('/admin/blog');
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error loading post', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isNew && user) {
            loadPost();
        } else if (isNew) {
            setIsLoading(false);
        }
    }, [id, user]);

    const handleSlugify = () => {
        if (!formData.title) return;
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData({ ...formData, slug });
    };

    const buildPostData = (overrides: Partial<BlogPostInput> = {}): BlogPostInput => {
        if (!user) throw new Error('Not authenticated');
        return {
            title: formData.title || '',
            slug: formData.slug || '',
            excerpt: formData.excerpt || '',
            content: formData.content || '',
            published: formData.published || false,
            tags: formData.tags || [],
            coverImage: formData.coverImage || '',
            status: formData.status || 'draft',
            scheduledAt: formData.scheduledAt || null,
            author: {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || null,
            },
            ...overrides,
        };
    };

    const savePost = async (postData: BlogPostInput) => {
        setIsSaving(true);
        try {
            if (isNew) {
                await createPost(postData);
            } else {
                await updatePost(id, postData);
            }
            return true;
        } catch (error) {
            console.error(error);
            toast({ title: 'Error saving post', variant: 'destructive' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // ======== ACTION HANDLERS ========

    const handlePreview = () => {
        const previewData = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            coverImage: formData.coverImage,
            tags: formData.tags,
        };
        sessionStorage.setItem('blog-preview', JSON.stringify(previewData));
        window.open('/admin/blog/preview', '_blank');
    };

    const handleSaveDraft = async () => {
        if (!user) return;
        if (!formData.title || !formData.slug) {
            toast({ title: 'Please fill in title and slug', variant: 'destructive' });
            return;
        }
        const postData = buildPostData({ published: false, status: 'draft', scheduledAt: null });
        const success = await savePost(postData);
        if (success) {
            toast({ title: '📝 Saved as draft' });
            setFormData(prev => ({ ...prev, status: 'draft', published: false }));
            if (isNew) router.push('/admin/blog');
        }
    };

    const handlePublishNow = async () => {
        if (!user) return;
        if (!formData.title || !formData.slug || !formData.content) {
            toast({ title: 'Please fill in title, slug, and content', variant: 'destructive' });
            return;
        }
        const postData = buildPostData({ published: true, status: 'published', scheduledAt: null });
        const success = await savePost(postData);
        if (success) {
            toast({ title: '🚀 Post published!' });
            setShowPublishDialog(false);
            setFormData(prev => ({ ...prev, status: 'published', published: true }));
            if (isNew) router.push('/admin/blog');
        }
    };

    const handleSchedule = async () => {
        if (!user) return;
        if (!scheduleDate || !scheduleTime) {
            toast({ title: 'Please set both date and time', variant: 'destructive' });
            return;
        }
        if (!formData.title || !formData.slug || !formData.content) {
            toast({ title: 'Please fill in title, slug, and content', variant: 'destructive' });
            return;
        }
        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledAt <= new Date()) {
            toast({ title: 'Scheduled time must be in the future', variant: 'destructive' });
            return;
        }
        const postData = buildPostData({ published: false, status: 'scheduled', scheduledAt });
        const success = await savePost(postData);
        if (success) {
            toast({ title: `📅 Post scheduled for ${scheduledAt.toLocaleString()}` });
            setShowPublishDialog(false);
            setFormData(prev => ({ ...prev, status: 'scheduled', scheduledAt }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file, `blog/${Date.now()}-${file.name}`).then(url => {
                setFormData({ ...formData, coverImage: url });
                toast({ title: 'Image uploaded!' });
            }).catch(err => {
                console.error(err);
                toast({ title: 'Upload failed', variant: 'destructive' });
            });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    }

    const statusLabel = formData.status === 'scheduled'
        ? '📅 Scheduled'
        : formData.status === 'published'
            ? '🟢 Published'
            : '📝 Draft';

    return (
        <AdminPasswordGate>
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                {/* Header with 3 Action Buttons */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/blog">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold font-headline">{isNew ? 'New Post' : 'Edit Post'}</h1>
                        <p className="text-xs text-muted-foreground">{statusLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePreview} disabled={!formData.content}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                        </Button>
                        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            Save as Draft
                        </Button>
                        <Button onClick={() => setShowPublishDialog(true)} disabled={isSaving}>
                            <Send className="mr-2 h-4 w-4" /> Publish
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    onBlur={isNew ? handleSlugify : undefined}
                                    placeholder="Your amazing blog post title"
                                    className="text-lg"
                                />
                            </div>
                            <div>
                                <Label>Slug</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="your-post-slug"
                                />
                                <p className="text-xs text-muted-foreground mt-1 text-primary">/blog/{formData.slug || 'your-slug-here'}</p>
                            </div>
                            <div>
                                <Label>Excerpt</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                    maxLength={160}
                                    placeholder="Brief description for search engines (max 160 chars)"
                                />
                                <p className={`text-xs mt-1 ${(formData.excerpt?.length || 0) > 155 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                                    {formData.excerpt?.length || 0}/160 characters
                                </p>
                            </div>
                            <div>
                                <Label className="flex items-center gap-1"><Hash className="h-3 w-3" /> Tags</Label>
                                <Input
                                    value={tagsInput}
                                    onChange={e => {
                                        setTagsInput(e.target.value);
                                        setFormData({
                                            ...formData,
                                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                        });
                                    }}
                                    placeholder="react, nextjs, tutorial (comma separated)"
                                />
                            </div>
                            <div>
                                <Label>Cover Image</Label>
                                <div className="flex items-center gap-4">
                                    <Input type="file" onChange={handleImageUpload} />
                                    {formData.coverImage && (
                                        <div className="h-10 w-10 relative shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={formData.coverImage} alt="Cover" className="h-full w-full object-cover rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <Label className="mb-2 block">Content</Label>
                        <RichTextEditor
                            content={formData.content || ''}
                            onChange={(html) => setFormData({ ...formData, content: html })}
                        />
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{contentStats.words} words</span>
                            <span>{contentStats.chars} characters</span>
                            <span>~{Math.ceil(contentStats.words / 200)} min read</span>
                        </div>
                    </div>
                </div>

                <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Publish Post</DialogTitle>
                            <DialogDescription>
                                Choose to publish now or schedule for later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Button
                                className="w-full h-14 text-left justify-start"
                                onClick={handlePublishNow}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Send className="mr-3 h-5 w-5" />}
                                <div>
                                    <p className="font-semibold">Publish Now</p>
                                    <p className="text-xs opacity-70">Make this post live immediately</p>
                                </div>
                            </Button>

                            <div className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Schedule for Later
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Date</Label>
                                        <Input
                                            type="date"
                                            value={scheduleDate}
                                            onChange={e => setScheduleDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Time</Label>
                                        <Input
                                            type="time"
                                            value={scheduleTime}
                                            onChange={e => setScheduleTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleSchedule}
                                    disabled={isSaving || !scheduleDate || !scheduleTime}
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                                    Schedule Post
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminPasswordGate>
    );
}
