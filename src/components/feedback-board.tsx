'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowBigUp, Flag, Lightbulb, MessageSquarePlus, Sparkles, Trophy, Rocket, Bug, Trash2, Reply, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/use-admin';
import {
    collection,
    query,
    orderBy,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';

interface FeedbackItem {
    id: string;
    type: 'bug' | 'suggestion';
    title: string;
    description: string;
    status: 'pending' | 'open' | 'in-progress' | 'resolved' | 'closed';
    upvotes: number;
    upvotedBy: string[];
    userId: string;
    userName: string;
    createdAt: any; // Firestore Timestamp or Date
    adminReply?: string;
    adminReplyAt?: string;
}

export function FeedbackBoard() {
    const { user, db } = useFirebase();
    const { isAdmin } = useAdmin();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'bug' | 'suggestion'>('bug');
    const [bugs, setBugs] = useState<FeedbackItem[]>([]);
    const [suggestions, setSuggestions] = useState<FeedbackItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [authorMap, setAuthorMap] = useState<Record<string, string>>({});

    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchFeedback();
    }, [db]); // Fetch when db is ready

    const fetchFeedback = async () => {
        if (!db) return;
        try {
            const q = query(
                collection(db, 'feedback'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const items: FeedbackItem[] = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    type: data.category === 'bug' ? 'bug' : 'suggestion',
                    upvotes: data.upvotedBy?.length || 0,
                    upvotedBy: data.upvotedBy || [],
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                } as FeedbackItem;
            });

            setBugs(items.filter(f => f.type === 'bug'));
            setSuggestions(items.filter(f => f.type === 'suggestion'));
        } catch (err: any) {
            console.error('Error fetching feedback:', err);
            setError('Failed to load feedback board.');
        }
    };

    // Form State
    const [newItemType, setNewItemType] = useState<'bug' | 'suggestion'>('bug');
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !db) {
            toast({ title: "Login Required", description: "You must be logged in to submit feedback.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                title: newItemTitle,
                description: newItemDesc,
                category: newItemType,
                status: 'pending',
                upvotedBy: [],
                createdAt: serverTimestamp()
            });

            toast({ title: "Success", description: "Feedback submitted successfully!" });
            setOpenSubmitDialog(false);
            setNewItemTitle('');
            setNewItemDesc('');
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (item: FeedbackItem) => {
        if (!user || !db) {
            toast({ title: "Login Required", description: "You must be logged in to vote.", variant: "destructive" });
            return;
        }

        const alreadyUpvoted = item.upvotedBy.includes(user.uid);
        const itemRef = doc(db, 'feedback', item.id);

        try {
            if (alreadyUpvoted) {
                // Remove vote
                await updateDoc(itemRef, {
                    upvotedBy: arrayRemove(user.uid)
                });
            } else {
                // Add vote
                await updateDoc(itemRef, {
                    upvotedBy: arrayUnion(user.uid)
                });
            }
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Error", description: "Failed to process vote.", variant: "destructive" });
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'feedback', itemId));
            toast({ title: "Deleted", description: "Feedback item removed." });
            setItemToDelete(null);
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleSaveReply = async (itemId: string) => {
        if (!db) return;
        setIsReplying(true);
        try {
            await updateDoc(doc(db, 'feedback', itemId), {
                adminReply: replyText,
                adminReplyAt: new Date().toISOString()
            });

            toast({ title: "Reply Saved" });
            setReplyingTo(null);
            setReplyText('');
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Failed to save reply", description: err.message, variant: "destructive" });
        } finally {
            setIsReplying(false);
        }
    };

    const handleStatusChange = async (itemId: string, newStatus: string) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, 'feedback', itemId), {
                status: newStatus
            });

            toast({ title: "Status Updated", description: `Item is now ${newStatus}` });
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    };

    const StatusBadge = ({ status, itemId }: { status: string, itemId?: string }) => {
        const styles = {
            'pending': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            'open': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20',
            'in-progress': 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
            'resolved': 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20',
            'closed': 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20',
        }[status] || 'bg-slate-500/10 text-slate-500';

        if (isAdmin && itemId) {
            return (
                <Select value={status} onValueChange={(val) => handleStatusChange(itemId, val)}>
                    <SelectTrigger className={`h-7 px-2 text-[10px] w-auto gap-1 border-0 bg-transparent hover:bg-transparent focus:ring-0 font-bold uppercase tracking-wider ${styles}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In-Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            );
        }

        return (
            <Badge variant="outline" className={`${styles} capitalize transition-colors`}>
                {status.replace('-', ' ')}
            </Badge>
        );
    };

    const renderList = (items: FeedbackItem[]) => (
        <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-muted/20 border border-dashed border-border/50 rounded-2xl"
                    >
                        <div className="p-4 rounded-full bg-muted/50">
                            <Sparkles className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">No items yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                Be the first to share your thoughts and help shape the future of Tool Daddy.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group relative border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex gap-4 md:gap-6">
                                        {/* 1. Vote Column */}
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <Button
                                                variant="outline"
                                                className={`
                                                    h-11 w-11 p-0 flex flex-col border transition-all duration-300 rounded-xl
                                                    ${(item.upvotedBy || []).includes(user?.uid || '')
                                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 hover:bg-primary/90"
                                                        : "hover:border-primary/50 hover:bg-primary/5"}
                                                `}
                                                onClick={() => handleUpvote(item)}
                                            >
                                                <ArrowBigUp className={`w-6 h-6 ${(item.upvotedBy || []).includes(user?.uid || '') ? 'fill-current' : ''}`} />
                                            </Button>
                                            <span className="text-sm font-bold tracking-tight">{item.upvotes}</span>
                                        </div>

                                        {/* 2. Content Column */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge status={item.status} itemId={item.id} />
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                                    {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">
                                                    BY {item.userName || authorMap[item.userId] || '...'}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap line-clamp-3 md:line-clamp-none">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Admin Reply Section */}
                                            {(item.adminReply || replyingTo === item.id) && (
                                                <div className="mt-4 pl-4 border-l-2 border-primary/30 py-1 space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                                                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center p-0.5">
                                                            <svg viewBox="0 0 420 420" className="w-full h-full"><path d="M128 341.333C128 304.6 154.6 278 181.333 278H234.667C261.4 278 288 304.6 288 341.333V341.333C288 378.067 261.4 404.667 234.667 404.667H181.333C154.6 404.667 128 378.067 128 341.333V341.333Z" fill="currentColor" /></svg>
                                                        </div>
                                                        Admin Response
                                                    </div>

                                                    {replyingTo === item.id ? (
                                                        <div className="space-y-3 pt-2">
                                                            <Textarea
                                                                placeholder="Type your official response..."
                                                                className="min-h-[80px] text-sm bg-background/40 border-primary/20 focus:border-primary/50 resize-none"
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 text-[10px] px-3 font-bold uppercase transition-all"
                                                                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 text-[10px] px-3 font-bold uppercase shadow-lg shadow-primary/20"
                                                                    onClick={() => handleSaveReply(item.id)}
                                                                    disabled={isReplying}
                                                                >
                                                                    {isReplying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                                                    Save Reply
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-foreground/80 italic font-medium leading-relaxed">
                                                            "{item.adminReply}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. Actions Column */}
                                        <div className="flex flex-col justify-start shrink-0">
                                            {(isAdmin || item.userId === user?.uid) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                                                    onClick={() => setItemToDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {isAdmin && !replyingTo && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                                    onClick={() => {
                                                        setReplyingTo(item.id);
                                                        setReplyText(item.adminReply || '');
                                                    }}
                                                >
                                                    <Reply className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This feedback item will be permanently deleted from our records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => itemToDelete && handleDelete(itemToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
