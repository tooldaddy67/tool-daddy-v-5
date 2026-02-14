'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    getDoc,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, Trash2, Reply, Check, Loader2,
    Bug, Lightbulb, Filter, MessageSquare,
    ChevronRight, Calendar, User, Search
} from 'lucide-react';
import Link from 'next/link';
import { AdminPasswordGate } from '@/components/admin-password-gate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

interface FeedbackItem {
    id: string;
    type: 'bug' | 'suggestion';
    title: string;
    description: string;
    status: 'pending' | 'open' | 'in-progress' | 'resolved' | 'closed';
    upvotes: number;
    userId: string;
    userName: string;
    createdAt: any;
    adminReply?: string;
    adminReplyAt?: any;
}

export default function AdminFeedbackPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore) return;

        let q = query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FeedbackItem));
            setItems(allItems);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching feedback:", err);
            toast({ title: "Error", description: "Failed to load feedback data.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);

    const handleStatusChange = async (itemId: string, newStatus: string) => {
        if (!firestore) return;
        try {
            await updateDoc(doc(firestore, 'feedback', itemId), { status: newStatus });
            toast({ title: "Status Updated", description: `Item is now ${newStatus}.` });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Update failed", variant: "destructive" });
        }
    };

    const handleSaveReply = async (itemId: string) => {
        if (!firestore) return;
        if (!replyText.trim()) return;

        setIsReplying(true);
        try {
            await updateDoc(doc(firestore, 'feedback', itemId), {
                adminReply: replyText,
                adminReplyAt: serverTimestamp(),
                status: 'resolved' // Auto-resolve on reply? Optional.
            });
            toast({ title: "Reply Sent", description: "Feedback resolution recorded." });
            setReplyingTo(null);
            setReplyText('');
        } catch (error) {
            console.error("Error saving reply:", error);
            toast({ title: "Failed to reply", variant: "destructive" });
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'feedback', itemId));
            toast({ title: "Deleted", description: "Feedback item removed permanently." });
        } catch (error) {
            toast({ title: "Delete failed", variant: "destructive" });
        } finally {
            setItemToDelete(null);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.userName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    return (
        <AdminPasswordGate>
            <div className="container mx-auto p-6 space-y-8 min-h-screen pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
                        <p className="text-muted-foreground">Review and respond to community bug reports and suggestions.</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search feedback, descriptions, or users..."
                                className="pl-9 bg-background/50 border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                                    <Filter className="h-3 w-3 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="bug">Bugs</SelectItem>
                                    <SelectItem value="suggestion">Suggestions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground text-sm font-medium">Fetching community feedback...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <Card className="border-dashed py-20 text-center bg-card/20">
                            <div className="space-y-2">
                                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                                <h3 className="font-semibold text-lg">No feedback found</h3>
                                <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
                            </div>
                        </Card>
                    ) : (
                        filteredItems.map(item => (
                            <Card key={item.id} className={`group relative transition-all border-border/40 hover:border-primary/20 ${item.status === 'resolved' ? 'opacity-70' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Meta Icon */}
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'bug' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {item.type === 'bug' ? <Bug className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 space-y-4 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                                    <Calendar className="h-3 w-3" />
                                                    {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/60">
                                                    <User className="h-3 w-3" />
                                                    {item.userName}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter">
                                                    {item.upvotes} UPVOTES
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold leading-tight flex items-center gap-2">
                                                    {item.title}
                                                    <span className="text-xs text-muted-foreground font-normal">#{item.id.slice(0, 6)}</span>
                                                </h3>
                                                <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Admin Reply Area */}
                                            {item.adminReply && !replyingTo && (
                                                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                                                        <Check className="h-3 w-3" /> Admin Response
                                                    </div>
                                                    <p className="text-sm italic text-foreground/80 font-medium">"{item.adminReply}"</p>
                                                </div>
                                            )}

                                            {replyingTo === item.id && (
                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-xs font-bold uppercase text-primary">Your Response</Label>
                                                    <Textarea
                                                        placeholder="Type a helpful response or resolution note..."
                                                        className="min-h-[100px] bg-background/50 border-primary/20 focus:border-primary/50"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                        <Button size="sm" onClick={() => handleSaveReply(item.id)} disabled={isReplying}>
                                                            {isReplying ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Check className="h-3 w-3 mr-2" />}
                                                            Post to Public
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column - Status & Actions */}
                                        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                                            <Select value={item.status} onValueChange={(val) => handleStatusChange(item.id, val)}>
                                                <SelectTrigger className="w-[140px] h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="flex gap-2">
                                                {!replyingTo && (
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setReplyingTo(item.id);
                                                        setReplyText(item.adminReply || '');
                                                    }}>
                                                        <Reply className="h-3 w-3 mr-2" />
                                                        {item.adminReply ? 'Edit Reply' : 'Reply'}
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setItemToDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this feedback?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove the submission and all associated votes.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => itemToDelete && handleDelete(itemToDelete)}>
                                Delete Permanent
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminPasswordGate>
    );
}

// Minimal components for this page
function Label({ className, children }: { className?: string, children: React.ReactNode }) {
    return <span className={`block ${className}`}>{children}</span>;
}
