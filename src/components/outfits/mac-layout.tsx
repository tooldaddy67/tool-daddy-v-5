'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TOOL_CATEGORIES } from '@/lib/constants';
import DynamicToolCard from '@/components/dynamic-tool-card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function MacLaunchpadLayout() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const allTools = useMemo(() => {
        return TOOL_CATEGORIES.flatMap(cat => cat.tools.map(tool => ({ ...tool, category: cat.name })));
    }, []);

    const filteredTools = useMemo(() => {
        if (!searchQuery) return allTools;
        return allTools.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allTools]);

    return (
        <div className="relative min-h-[500px] w-full flex items-center justify-center overflow-hidden">
            {/* Base Interface Content (The "Chat" or background) */}
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-white/20">
                    <Search className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="text-3xl font-semibold text-zinc-800">Tool Launchpad</h2>
                <p className="text-zinc-500 max-w-md">Press the button below or use Alt+Space to toggle the launchpad overlay.</p>
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-8 py-3 bg-zinc-900 text-white rounded-full font-medium hover:scale-105 transition-transform shadow-xl"
                >
                    Show All Tools
                </button>
            </div>

            {/* Launchpad Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-8"
                    >
                        {/* Background Blur */}
                        <div
                            className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[40px] saturate-150"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Search Bar (Spotlight Style) */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative w-full max-w-xl z-10 mb-12"
                        >
                            <div className="absolute inset-y-0 left-4 flex items-center">
                                <Search className="w-5 h-5 text-zinc-400" />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tools..."
                                className="w-full bg-white/50 dark:bg-zinc-800/50 border border-white/20 dark:border-white/10 rounded-xl h-14 pl-12 pr-12 text-xl font-medium outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl backdrop-blur-md"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </motion.div>

                        {/* Tools Grid */}
                        <motion.div
                            layout
                            className="relative w-full max-w-7xl z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-20 overflow-y-auto"
                        >
                            {filteredTools.map((tool, idx) => (
                                <Link key={tool.name} href={tool.href} className="block">
                                    <motion.div
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.01 }}
                                        className="flex flex-col items-center space-y-3 cursor-pointer group"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-white dark:bg-zinc-900 border border-white/30 dark:border-white/10 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                            <tool.icon className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-800 dark:text-zinc-100" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white text-center drop-shadow-md">
                                            {tool.name}
                                        </span>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>

                        {/* Close Button / Background Click */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="fixed top-8 right-8 z-[110] w-12 h-12 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
                        >
                            <X className="w-6 h-6 text-zinc-800 dark:text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
