'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowBigUp, Bug, Lightbulb, MessageSquarePlus, Sparkles, Trash2, Reply, Check, Loader2, Filter, Search, Zap } from 'lucide-react';
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
import { useSettings } from '@/components/settings-provider';
import { cn } from '@/lib/utils';
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
    createdAt: any;
    adminReply?: string;
    adminReplyAt?: string;
}

export function FeedbackBoard() {
    const { user, db } = useFirebase();
    const { isAdmin } = useAdmin();
    const { settings } = useSettings();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<'bug' | 'suggestion'>('bug');
    const [bugs, setBugs] = useState<FeedbackItem[]>([]);
    const [suggestions, setSuggestions] = useState<FeedbackItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [authorMap, setAuthorMap] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const [mounted, setMounted] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    // Form State
    const [newItemType, setNewItemType] = useState<'bug' | 'suggestion'>('bug');
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    useEffect(() => {
        setMounted(true);
        fetchFeedback();
    }, [db]);

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
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
                } as FeedbackItem;
            });

            setBugs(items.filter(f => f.type === 'bug'));
            setSuggestions(items.filter(f => f.type === 'suggestion'));
        } catch (err: any) {
            console.error('Error fetching feedback:', err);
        }
    };

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
                await updateDoc(itemRef, { upvotedBy: arrayRemove(user.uid) });
            } else {
                await updateDoc(itemRef, { upvotedBy: arrayUnion(user.uid) });
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
            await updateDoc(doc(db, 'feedback', itemId), { status: newStatus });
            toast({ title: "Status Updated", description: `Item is now ${newStatus}` });
            fetchFeedback();
        } catch (err: any) {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    };

    // --- Components ---

    const StatusBadge = ({ status, itemId }: { status: string, itemId?: string }) => {
        const styles = {
            'pending': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            'open': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'in-progress': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'resolved': 'bg-green-500/10 text-green-500 border-green-500/20',
            'closed': 'bg-red-500/10 text-red-500 border-red-500/20',
        }[status] || 'bg-slate-500/10 text-slate-500';

        if (isAdmin && itemId) {
            return (
                <Select value={status} onValueChange={(val) => handleStatusChange(itemId, val)}>
                    <SelectTrigger className={cn("h-6 px-2 text-[10px] w-auto gap-1 border-0 bg-transparent hover:bg-transparent focus:ring-0 font-bold uppercase tracking-wider", styles)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {['pending', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }
        return (
            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider border-0", styles)}>
                {status.replace('-', ' ')}
            </Badge>
        );
    };

    const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
        const isNeo = settings.cardStyle === 'neo';
        const isGlass = settings.cardStyle === 'glass';

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group h-full"
            >
                <div
                    className={cn(
                        "relative h-full flex flex-col p-5 transition-all duration-300 rounded-[var(--card-radius)] overflow-hidden",
                        isNeo ? "bg-card border-2 border-primary shadow-[4px_4px_0px_var(--primary)] text-card-foreground" :
                            isGlass ? "bg-white/5 backdrop-blur-md border border-white/10 shadow-xl" :
                                "bg-card border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-md"
                    )}
                >
                    {/* Status Line */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 items-center">
                            <StatusBadge status={item.status} itemId={item.id} />
                            <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest">
                                {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                            </span>
                        </div>
                        {(isAdmin || item.userId === user?.uid) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mr-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => setItemToDelete(item.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 mb-4">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                            {item.description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed border-border/30">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpvote(item)}
                                className={cn(
                                    "h-8 px-3 gap-2 rounded-full font-bold transition-all border",
                                    (item.upvotedBy || []).includes(user?.uid || '')
                                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                                        : "bg-transparent border-border/50 hover:border-primary/50"
                                )}
                            >
                                <ArrowBigUp className={cn("w-4 h-4", (item.upvotedBy || []).includes(user?.uid || '') && "fill-current")} />
                                <span>{item.upvotes}</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-[10px] font-bold uppercase opacity-40">
                                {item.userName || 'Anonymous'}
                            </div>
                            {item.adminReply && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    <Reply className="w-3 h-3" /> Replied
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Reply Input / Display */}
                    {(item.adminReply || replyingTo === item.id) && (
                        <div className="mt-4 pt-3 border-t border-border/30 bg-muted/20 -mx-5 -mb-5 px-5 py-3">
                            {replyingTo === item.id ? (
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Admin response..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        className="text-xs min-h-[60px] bg-background/50"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="h-6 text-[10px]">Cancel</Button>
                                        <Button size="sm" onClick={() => handleSaveReply(item.id)} disabled={isReplying} className="h-6 text-[10px]">Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="w-1 bg-primary rounded-full" />
                                    <div>
                                        <div className="text-[10px] font-bold text-primary uppercase mb-1">Admin Response</div>
                                        <p className="text-xs text-foreground/80 italic">"{item.adminReply}"</p>
                                    </div>
                                    {isAdmin && (
                                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto opacity-50 hover:opacity-100" onClick={() => { setReplyingTo(item.id); setReplyText(item.adminReply || ''); }}>
                                            <Reply className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {isAdmin && !replyingTo && !item.adminReply && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-10 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => { setReplyingTo(item.id); setReplyText(''); }}
                        >
                            <Reply className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </motion.div>
        );
    };

    if (!mounted) return null;

    const filteredBugs = bugs.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredSuggestions = suggestions.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header Hero */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between relative overflow-hidden p-8 rounded-[30px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/5">
                <div className="space-y-4 relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                        <Zap className="w-3 h-3 fill-current" />
                        Shape the future
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.9] text-foreground">
                        Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">Feedback</span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Have a brilliant idea or spotted a bug? This is the place to help us build a better tool for everyone.
                    </p>
                </div>

                <Dialog open={openSubmitDialog} onOpenChange={setOpenSubmitDialog}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform z-10">
                            <MessageSquarePlus className="w-5 h-5 mr-2" />
                            Submit Feedback
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] border-primary/20 bg-background/95 backdrop-blur-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">New Submission</DialogTitle>
                            <DialogDescription>Let us know what's on your mind.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-xl">
                                <button type="button" onClick={() => setNewItemType('bug')} className={cn("py-2 px-4 rounded-lg text-sm font-bold transition-all", newItemType === 'bug' ? "bg-background shadow-sm text-red-500" : "text-muted-foreground hover:text-foreground")}>Bug Report</button>
                                <button type="button" onClick={() => setNewItemType('suggestion')} className={cn("py-2 px-4 rounded-lg text-sm font-bold transition-all", newItemType === 'suggestion' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>Feature Request</button>
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="What's the topic?" className="bg-muted/30 border-primary/10 focus:border-primary/50 h-10" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Tell us more details..." className="bg-muted/30 border-primary/10 focus:border-primary/50 min-h-[120px]" required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl font-bold">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Decorative BG element */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Controls */}
            <div className="sticky top-4 z-40 bg-background/80 backdrop-blur-xl p-2 rounded-2xl border border-border/50 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
                    <TabsList className="bg-muted/50 p-1 h-12 rounded-xl w-full sm:w-auto">
                        <TabsTrigger value="bug" className="rounded-lg h-10 px-6 gap-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-red-500">
                            <Bug className="w-4 h-4" /> Bug Reports
                        </TabsTrigger>
                        <TabsTrigger value="suggestion" className="rounded-lg h-10 px-6 gap-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary">
                            <Lightbulb className="w-4 h-4" /> Suggestions
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-primary/30"
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {(activeTab === 'bug' ? filteredBugs : filteredSuggestions).map((item) => (
                            <FeedbackCard key={item.id} item={item} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Empty State */}
                {((activeTab === 'bug' ? filteredBugs : filteredSuggestions).length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6 text-primary">
                            <Filter className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">No feedback found</h3>
                        <p className="text-sm max-w-xs mx-auto mt-2">Try adjusting your search or be the first to submit a new idea.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feedback?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
