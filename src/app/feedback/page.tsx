'use client';

import dynamic from 'next/dynamic';

const FeedbackBoard = dynamic(() => import('@/components/feedback-board').then(mod => mod.FeedbackBoard), {
    ssr: false
});

export default function FeedbackPage() {
    return <FeedbackBoard />;
}
