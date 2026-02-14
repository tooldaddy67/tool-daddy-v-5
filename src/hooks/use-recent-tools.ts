'use client';

import { useState, useEffect, useCallback } from 'react';

const RECENT_TOOLS_KEY = 'tool-daddy-recent-mobile';
const MAX_RECENT_TOOLS = 8;

export interface RecentTool {
    name: string;
    timestamp: number;
}

export function useRecentTools() {
    const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_TOOLS_KEY);
            if (stored) {
                setRecentTools(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load recent tools', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const addRecentTool = useCallback((name: string) => {
        setRecentTools(prev => {
            // Remove existing entry for this tool to move it to the front
            const filtered = prev.filter(t => t.name !== name);
            const updated = [{ name, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_TOOLS);

            try {
                localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save recent tools', error);
            }

            return updated;
        });
    }, []);

    return { recentTools, isLoaded, addRecentTool };
}
