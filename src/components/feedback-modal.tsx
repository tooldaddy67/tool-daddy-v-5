'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FeedbackModal({ trigger }: { trigger?: React.ReactNode }) {
    const { user } = useFirebase();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [type, setType] = useState('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        toast({
            title: "Feature Disabled",
            description: "Feedback is currently unavailable during system rebuild.",
            variant: "destructive"
        });
        setIsSubmitting(false);
        setOpen(false);
        setMessage('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground h-auto p-0 md:p-2 md:h-9">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feedback
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Feedback</DialogTitle>
                    <DialogDescription>
                        Report a bug, suggest a feature, or just say hello.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Feedback Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell us what happened..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                            required
                        />
                    </div>

                    {!user && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Where can we reach you?"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || !message.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Feedback
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
