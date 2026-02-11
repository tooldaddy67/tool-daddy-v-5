'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowBigUp, Flag, Lightbulb, MessageSquarePlus, Sparkles, Trophy, Rocket, Bug, Trash2 } from 'lucide-react';
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

interface FeedbackItem {
    id: string;
    type: 'bug' | 'suggestion';
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    upvotes: number;
    upvotedBy: string[];
    userId: string;
    createdAt: any;
}

export function FeedbackBoard() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'bug' | 'suggestion'>('bug');
    const [bugs, setBugs] = useState<FeedbackItem[]>([]);
    const [suggestions, setSuggestions] = useState<FeedbackItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [authorMap, setAuthorMap] = useState<Record<string, string>>({});

    // State for mounted check to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user || !firestore) return;
            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().isAdmin === true) {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error("Error checking admin status:", err);
            }
        };
        checkAdmin();
    }, [user, firestore]);

    // Form State
    const [newItemType, setNewItemType] = useState<'bug' | 'suggestion'>('bug');
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    useEffect(() => {
        if (!firestore) return;

        const q = query(collection(firestore, 'feedback'), orderBy('upvotes', 'desc'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const allItems: FeedbackItem[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FeedbackItem));

            setBugs(allItems.filter(item => item.type === 'bug'));
            setSuggestions(allItems.filter(item => item.type === 'suggestion'));
            setError(null);

            // Fetch author names for new items
            const newUids = allItems.map(i => i.userId).filter(uid => !authorMap[uid]);
            if (newUids.length > 0) {
                const uniqueUids = Array.from(new Set(newUids));
                const newAuthorData: Record<string, string> = { ...authorMap };

                await Promise.all(uniqueUids.map(async (uid) => {
                    try {
                        const uDoc = await getDoc(doc(firestore, 'users', uid));
                        if (uDoc.exists()) {
                            const userData = uDoc.data();
                            newAuthorData[uid] = userData.displayName || userData.email || 'Unknown User';
                        } else {
                            newAuthorData[uid] = 'Deleted User';
                        }
                    } catch (e) {
                        newAuthorData[uid] = 'User';
                    }
                }));
                setAuthorMap(newAuthorData);
            }
        }, (err) => {
            console.error("Error fetching feedback:", err);
            if (err.code === 'permission-denied') {
                setError("Missing permissions. Please deploy Firestore rules.");
            } else {
                setError("Failed to load feedback.");
            }
        });

        return () => unsubscribe();
    }, [firestore]);

    if (!mounted) return null; // Prevent hydration mismatch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore) {
            toast({ title: "Sign in required", description: "You must be signed in to submit feedback.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'feedback'), {
                type: newItemType,
                title: newItemTitle,
                description: newItemDesc,
                status: 'open',
                upvotes: 0,
                upvotedBy: [],
                userId: user.uid,
                createdAt: serverTimestamp()
            });

            toast({ title: "Feedback Submitted", description: "Thank you for your contribution!" });
            setOpenSubmitDialog(false);
            setNewItemTitle('');
            setNewItemDesc('');
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (item: FeedbackItem) => {
        if (!user || !firestore) {
            toast({ title: "Sign in required", description: "You must be signed in to vote.", variant: "destructive" });
            return;
        }

        const upvotedBy = item.upvotedBy || [];
        const userUpvoted = upvotedBy.includes(user.uid);
        const feedbackRef = doc(firestore, 'feedback', item.id);

        // Optimistic UI Update
        const updatedItems = (items: FeedbackItem[]) =>
            items.map(i => {
                if (i.id === item.id) {
                    return {
                        ...i,
                        upvotes: userUpvoted ? i.upvotes - 1 : i.upvotes + 1,
                        upvotedBy: userUpvoted
                            ? i.upvotedBy.filter(id => id !== user.uid)
                            : [...(i.upvotedBy || []), user.uid]
                    };
                }
                return i;
            });

        // Apply to both lists (they are filtered later but easier to just update both if they contain the item)
        setBugs(prev => updatedItems(prev));
        setSuggestions(prev => updatedItems(prev));

        try {
            if (userUpvoted) {
                await updateDoc(feedbackRef, {
                    upvotes: increment(-1),
                    upvotedBy: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(feedbackRef, {
                    upvotes: increment(1),
                    upvotedBy: arrayUnion(user.uid)
                });
            }
        } catch (error: any) {
            console.error("Error updating vote:", error);

            // Rollback optimistic update on error
            // (The onSnapshot will eventually fix the state, but we should revert it now for clarity)
            // Actually, onSnapshot will fire immediately with the server's truth (or error state), 
            // but we'll show a toast to explain why it reverted.

            let errorMsg = "Failed to update vote.";
            if (error?.code === 'permission-denied') {
                errorMsg = "Firestore permission denied. You can only update your own profile/settings in some rulesets. Ask Admin to allow 'update' on 'feedback' for all authenticated users.";
            } else if (error?.message) {
                errorMsg = error.message;
            }

            toast({
                title: "Vote failed",
                description: errorMsg,
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!firestore) return;

        try {
            await deleteDoc(doc(firestore, 'feedback', itemId));
            toast({ title: "Deleted", description: "Feedback item has been removed." });
        } catch (error: any) {
            console.error("Error deleting feedback:", error);
            toast({
                title: "Delete failed",
                description: error.code === 'permission-denied'
                    ? "You don't have permission to delete this."
                    : "An error occurred while deleting.",
                variant: "destructive"
            });
        } finally {
            setItemToDelete(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            'open': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20',
            'in-progress': 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
            'resolved': 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20',
            'closed': 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20',
        }[status] || 'bg-slate-500/10 text-slate-500';

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
                                                <StatusBadge status={item.status} />
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                                    {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">
                                                    BY {authorMap[item.userId] || '...'}
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

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradients - Adjusted for Deep Black Theme */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container max-w-5xl py-24 relative z-10 px-4 md:px-0">
                {error && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg mb-8 flex items-center justify-center gap-3 max-w-lg mx-auto">
                        <Flag className="w-5 h-5" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Centered Header Section */}
                <div className="flex flex-col items-center text-center gap-6 mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                        <Sparkles className="w-4 h-4" />
                        <span>Public Beta</span>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
                            Community Feedback
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                            Help us build the ultimate tool suite. Report bugs, track progress, and vote on the features you want to see next.
                        </p>
                    </div>

                    <Dialog open={openSubmitDialog} onOpenChange={setOpenSubmitDialog}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base font-semibold rounded-full">
                                <MessageSquarePlus className="mr-2 h-5 w-5" />
                                Submit Feedback
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Submit Feedback</DialogTitle>
                                <DialogDescription>
                                    Share your thoughts safely. Your voice shapes our roadmap.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Feedback Type</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${newItemType === 'bug' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                            onClick={() => setNewItemType('bug')}
                                        >
                                            <Bug className={`w-6 h-6 ${newItemType === 'bug' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`text-sm font-medium ${newItemType === 'bug' ? 'text-primary' : 'text-muted-foreground'}`}>Bug Report</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${newItemType === 'suggestion' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                            onClick={() => setNewItemType('suggestion')}
                                        >
                                            <Lightbulb className={`w-6 h-6 ${newItemType === 'suggestion' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`text-sm font-medium ${newItemType === 'suggestion' ? 'text-primary' : 'text-muted-foreground'}`}>Suggestion</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Brief summary of the issue or idea"
                                        value={newItemTitle}
                                        onChange={(e) => setNewItemTitle(e.target.value)}
                                        required
                                        className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Explain in detail... Steps to reproduce, expected behavior, etc."
                                        value={newItemDesc}
                                        onChange={(e) => setNewItemDesc(e.target.value)}
                                        required
                                        className="min-h-[150px] bg-background/50 focus:bg-background transition-colors resize-none"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Tabs defaultValue="bug" onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                        <TabsList className="w-full p-1 bg-muted/20 backdrop-blur-md rounded-full border border-border/40 mb-10">
                            <TabsTrigger
                                value="bug"
                                className="w-1/2 rounded-full py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-base"
                            >
                                <div className="flex items-center gap-2">
                                    <Bug className="w-4 h-4" />
                                    <span>Bug Reports</span>
                                    <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5 min-w-[1.25rem] bg-background/50">{bugs.length}</Badge>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="suggestion"
                                className="w-1/2 rounded-full py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all text-base"
                            >
                                <div className="flex items-center gap-2">
                                    <Rocket className="w-4 h-4" />
                                    <span>Feature Requests</span>
                                    <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5 min-w-[1.25rem] bg-background/50">{suggestions.length}</Badge>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="bug" className="mt-0">
                            {renderList(bugs)}
                        </TabsContent>

                        <TabsContent value="suggestion" className="mt-0">
                            {renderList(suggestions)}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
