'use client';

import React from 'react';
import { TOOL_CATEGORIES } from '@/lib/constants';
import DynamicToolCard from '@/components/dynamic-tool-card';
import {
    Folder,
    Settings,
    Globe,
    FileText,
    ChevronRight,
    Search,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function XPToolLayout() {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-[#ece9d8] min-h-screen font-['Tahoma']">
            {/* XP Sidebar - Common Tasks */}
            <aside className="w-full md:w-64 space-y-4">
                <div className="bg-white rounded-t-lg border border-[#7195d2] overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between">
                        <span className="text-white font-bold text-sm">Category Tasks</span>
                        <ChevronRight className="w-4 h-4 text-white rotate-90" />
                    </div>
                    <div className="p-4 bg-[#d6dff7] space-y-3">
                        <button className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs">
                            <Folder className="w-4 h-4" /> View as Web Page
                        </button>
                        <button className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs">
                            <Search className="w-4 h-4" /> Search for tools
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-t-lg border border-[#7195d2] overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between">
                        <span className="text-white font-bold text-sm">Other Places</span>
                        <ChevronRight className="w-4 h-4 text-white rotate-90" />
                    </div>
                    <div className="p-4 bg-[#d6dff7] space-y-3">
                        <button className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left">
                            <FileText className="w-4 h-4" /> My Documents
                        </button>
                        <button className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left">
                            <Globe className="w-4 h-4" /> My Network Places
                        </button>
                        <button className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left">
                            <Settings className="w-4 h-4" /> System Tasks
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-t-lg border border-[#7195d2] overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between">
                        <span className="text-white font-bold text-sm">Details</span>
                        <ChevronRight className="w-4 h-4 text-white rotate-90" />
                    </div>
                    <div className="p-4 bg-[#d6dff7]">
                        <p className="text-xs font-bold text-[#215dc6]">Tool Daddy v5</p>
                        <p className="text-[10px] text-[#215dc6]">Select an item to view its description.</p>
                    </div>
                </div>
            </aside>

            {/* XP Main Content Area */}
            <main className="flex-1 bg-white border border-[#7195d2] p-8 shadow-inner overflow-auto max-h-[85vh]">
                <div className="space-y-12">
                    {TOOL_CATEGORIES.map((category) => (
                        <section key={category.name} className="space-y-6">
                            <div className="flex items-center gap-2 border-b-2 border-[#ff9900] pb-2">
                                <Folder className="w-8 h-8 text-[#ffcc00] fill-[#ffcc00]" />
                                <h2 className="text-2xl font-bold text-[#003366] italic underline">{category.name}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {category.tools.map((tool, idx) => (
                                    <div key={tool.name} onClick={() => {
                                        // Play a low-bitrate click sound here if implemented
                                        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
                                        audio.volume = 0.3;
                                        audio.play().catch(() => { });
                                    }}>
                                        <DynamicToolCard
                                            href={tool.href}
                                            name={tool.name}
                                            description={tool.description}
                                            icon={tool.icon}
                                            variantIndex={idx}
                                            className="border-none shadow-none bg-transparent hover:bg-[#d6dff7] p-2 rounded cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
