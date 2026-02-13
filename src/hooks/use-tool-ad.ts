'use client';

import { useState } from 'react';

export type ToolType = 'standard' | 'heavy' | 'ai' | 'external' | 'heavy_ai';

export function useToolAd(toolType: ToolType = 'standard') {
    const [isAdOpen, setIsAdOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Standard is 5s, AI/Heavy/External is 10s
    // "Sometimes more than 1 ad" - we'll handle this by increasing duration or sequence
    // For now let's just use the durations provided.

    let duration = 5;
    if (toolType === 'ai' || toolType === 'heavy' || toolType === 'external') duration = 10;
    if (toolType === 'heavy_ai') duration = 20; // 2 ads worth

    const showAd = (action: () => void) => {
        // Force ad for all tools as requested
        setPendingAction(() => action);
        setIsAdOpen(true);
    };

    const handleAdFinish = () => {
        setIsAdOpen(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    return {
        isAdOpen,
        setIsAdOpen,
        showAd,
        handleAdFinish,
        duration,
        title: toolType === 'standard' ? "Processing your request..." : "Running advanced calculations..."
    };
}
