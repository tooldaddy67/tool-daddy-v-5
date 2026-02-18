'use client';

import { FeedbackBoard } from '@/components/feedback-board';

export default function AdminFeedbackPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
                <p className="text-muted-foreground">Review bug reports and feature requests from the community.</p>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-1">
                <FeedbackBoard />
            </div>
        </div>
    );
}
