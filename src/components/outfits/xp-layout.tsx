import React, { useState } from 'react';
import Link from 'next/link';
import { TOOL_CATEGORIES } from '@/lib/constants';
import { useSettings } from '../settings-provider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const ICON_BASE = "https://win98icons.alexmeub.com/icons/png";

// Mapping Tool Names/Categories to Original 98/XP Icon Files
const getXPIcon = (type: string) => {
    const map: Record<string, string> = {
        'Productivity': 'directory_closed-4.png',
        'AI Tools': 'msagent-0.png',
        'Media Studio': 'media_player-0.png',
        'Simple Notepad': 'notepad-0.png',
        'Timer & Stopwatch': 'clock-0.png',
        'To-Do List': 'task_checklist-0.png',
        'AI Text Humanizer': 'msagent-3.png',
        'AI Image Enhancer': 'image_editor-0.png',
        'AI Playlist Maker': 'mmsys_cp-2.png',
        'Numeronym Generator': 'calculator-0.png',
        'Image Compressor': 'compress-0.png',
        'Image Converter': 'image_old-0.png',
        'Color Palette Extractor': 'paint_old-0.png',
        'Metadata Extractor': 'briefcase-0.png',
        'Video to Audio': 'mmsys_cp-0.png',
        'Video Compressor': 'camera_video-0.png',
        'YouTube Downloader': 'download-0.png',
        'YouTube to Audio': 'mmsys_cp-4.png',
        'YouTube to Image': 'image_old-4.png',
        'Drawing Canvas': 'paint-0.png',
        'Palette Generator': 'paint_old-4.png',
        'ASCII Art Generator': 'notepad-4.png',
        'System Tasks': 'settings_gear-0.png',
        'Other Places': 'world-0.png',
        'Details': 'help_book-0.png',
        'My Documents': 'directory_open_file_mydocs-4.png',
        'My Network Places': 'network_drive-0.png',
        'View system information': 'computer_explorer-4.png',
        'History': 'history-0.png'
    };
    return `${ICON_BASE}/${map[type] || 'joy-0.png'}`;
};

function XPCard({ tool, idx, onClick, onHover }: { tool: any, idx: number, onClick: () => void, onHover: (tool: any) => void }) {
    return (
        <Link
            href={tool.href}
            onClick={onClick}
            onMouseEnter={() => onHover(tool)}
            onMouseLeave={() => onHover(null)}
            className="group flex items-center gap-4 p-3 rounded hover:bg-[#3169c6] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#ffffff]"
        >
            <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#f1f1f1] rounded-lg shadow-[inset_-1px_-1px_#ffffff,inset_1px_1px_#000000] border border-[#7195d2] group-hover:bg-[#ffffff20]">
                <img
                    src={getXPIcon(tool.name)}
                    alt={tool.name}
                    className="w-8 h-8 object-contain pixelated"
                />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-[#215dc6] group-hover:text-white truncate font-['Tahoma']">
                    {tool.name}
                </span>
                <span className="text-[11px] text-[#444] group-hover:text-[#ffffffaa] line-clamp-2 leading-tight font-['Tahoma']">
                    {tool.description}
                </span>
            </div>
        </Link>
    );
}

export function XPToolLayout() {
    const { setSettingsOpen } = useSettings();
    const router = useRouter();
    const [hoveredTool, setHoveredTool] = useState<any>(null);
    const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});

    const handleSound = () => {
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => { });
    };

    const handleAction = (action: () => void) => {
        handleSound();
        action();
    };

    const toggleCollapse = (key: string) => {
        handleSound();
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-[#ece9d8] min-h-screen font-['Tahoma']">
            {/* XP Sidebar - Common Tasks */}
            <aside className="w-full md:w-64 space-y-4 shrink-0">
                <div className="bg-white rounded-t-lg border border-[#7195d2] shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleCollapse('system')}
                        className="w-full bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-2">
                            <img src={getXPIcon('System Tasks')} className="w-4 h-4" />
                            <span className="text-white font-bold text-sm">System Tasks</span>
                        </div>
                        <img
                            src="https://win98icons.alexmeub.com/icons/png/chevron_down-0.png"
                            className={cn("w-4 h-4 transition-transform duration-200", collapsed['system'] ? "-rotate-90" : "")}
                        />
                    </button>
                    {!collapsed['system'] && (
                        <div className="p-4 bg-[#d6dff7] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <button
                                onClick={() => handleAction(() => router.push('/about'))}
                                className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left w-full font-['Tahoma']"
                            >
                                <img src={getXPIcon('View system information')} className="w-4 h-4" /> View system information
                            </button>
                            <button
                                onClick={() => handleAction(() => setSettingsOpen(true))}
                                className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left w-full font-['Tahoma']"
                            >
                                <img src={getXPIcon('System Tasks')} className="w-4 h-4" /> Change a setting
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-t-lg border border-[#7195d2] shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleCollapse('places')}
                        className="w-full bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-2">
                            <img src={getXPIcon('Other Places')} className="w-4 h-4" />
                            <span className="text-white font-bold text-sm">Other Places</span>
                        </div>
                        <img
                            src="https://win98icons.alexmeub.com/icons/png/chevron_down-0.png"
                            className={cn("w-4 h-4 transition-transform duration-200", collapsed['places'] ? "-rotate-90" : "")}
                        />
                    </button>
                    {!collapsed['places'] && (
                        <div className="p-4 bg-[#d6dff7] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <button
                                onClick={() => handleAction(() => router.push('/history'))}
                                className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left w-full font-['Tahoma']"
                            >
                                <img src={getXPIcon('My Documents')} className="w-4 h-4" /> My Documents
                            </button>
                            <button
                                onClick={() => handleAction(() => router.push('/tools'))}
                                className="flex items-center gap-2 text-[#215dc6] hover:underline text-xs text-left w-full font-['Tahoma']"
                            >
                                <img src={getXPIcon('My Network Places')} className="w-4 h-4" /> My Network Places
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-t-lg border border-[#7195d2] shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleCollapse('details')}
                        className="w-full bg-gradient-to-r from-[#74a0eb] to-[#a7c6f0] p-2 flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-2">
                            <img src={getXPIcon('Details')} className="w-4 h-4" />
                            <span className="text-white font-bold text-sm">Details</span>
                        </div>
                        <img
                            src="https://win98icons.alexmeub.com/icons/png/chevron_down-0.png"
                            className={cn("w-4 h-4 transition-transform duration-200", collapsed['details'] ? "-rotate-90" : "")}
                        />
                    </button>
                    {!collapsed['details'] && (
                        <div className="p-4 bg-[#d6dff7] min-h-[80px] animate-in fade-in slide-in-from-top-1 duration-200 font-['Tahoma']">
                            {hoveredTool ? (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-[#215dc6]">{hoveredTool.name}</p>
                                    <p className="text-[10px] text-[#215dc6] leading-tight opacity-80">{hoveredTool.description}</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-bold text-[#215dc6]">Tool Daddy v5</p>
                                    <p className="text-[10px] text-[#215dc6]">Select an item to view its description.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* XP Main Content Area */}
            <main className="flex-1 bg-white border border-[#7195d2] p-8 shadow-inner overflow-auto max-h-[90vh]">
                <div className="space-y-12">
                    {TOOL_CATEGORIES.map((category) => (
                        <section key={category.name} className="space-y-4">
                            <div className="flex items-center gap-2 border-b-2 border-[#ff9900] pb-1">
                                <img src={getXPIcon(category.name)} className="w-6 h-6" />
                                <h2 className="text-xl font-bold text-[#003366] italic underline font-['Tahoma']">{category.name}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                {category.tools.map((tool, idx) => (
                                    <XPCard
                                        key={tool.name}
                                        tool={tool}
                                        idx={idx}
                                        onClick={handleSound}
                                        onHover={setHoveredTool}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
