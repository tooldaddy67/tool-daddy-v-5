'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TOOL_CATEGORIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export function TerminalLayout() {
    const [history, setHistory] = useState<string[]>(['Welcome to Tool Daddy Terminal v5.0.0 (Linux 6.6-plasma)', 'Type "help" to see available commands.', '']);
    const [input, setInput] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const allTools = TOOL_CATEGORIES.flatMap(cat => cat.tools);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;

        let output = [`root@tooldaddy:~$ ${input}`];

        const args = cmd.split(' ');
        const baseCmd = args[0];

        if (baseCmd === 'help') {
            if (args[1]) {
                const tool = allTools.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === args[1] || t.href.includes(args[1]));
                if (tool) {
                    output.push(`MAN PAGE: ${tool.name.toUpperCase()}`);
                    output.push(`DESCRIPTION: ${tool.description}`);
                    output.push(`USAGE: ai-tool --launch "${args[1]}"`);
                    output.push(`FLAGS: --model=nano-banana, --quality=high, --force`);
                } else {
                    output.push(`No manual entry for ${args[1]}`);
                }
            } else {
                output.push('AVAILABLE COMMANDS:');
                output.push('  help [tool]   - Show usage info for a tool');
                output.push('  list          - List all available tools');
                output.push('  clear         - Clear terminal history');
                output.push('  ai-tool       - Core tool launcher');
                output.push('  exit          - Return to desktop');
            }
        } else if (baseCmd === 'list') {
            output.push('CATALOGED TOOLS:');
            TOOL_CATEGORIES.forEach(cat => {
                output.push(`\n[${cat.name.toUpperCase()}]`);
                cat.tools.forEach(t => {
                    output.push(`  - ${t.name.toLowerCase().replace(/\s+/g, '-')} (${t.description.substring(0, 40)}...)`);
                });
            });
        } else if (baseCmd === 'clear') {
            setHistory(['']);
            setInput('');
            return;
        } else if (baseCmd === 'ai-tool') {
            if (cmd.includes('--launch') || args[1]) {
                const toolName = cmd.match(/"([^"]+)"/)?.[1] || args[2] || args[1];
                const tool = allTools.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === toolName || t.href.includes(toolName));
                if (tool) {
                    output.push(`Executing ${tool.name}... Initating boot sequence.`);
                    output.push(`Redirecting to ${tool.href}...`);
                    setTimeout(() => {
                        router.push(tool.href);
                    }, 1000);
                } else {
                    output.push(`Error: Tool "${toolName}" not found in local repositories.`);
                }
            } else {
                output.push('Usage: ai-tool --launch "tool-name"');
            }
        } else if (baseCmd === 'exit') {
            output.push('Logging out... session terminated.');
            setTimeout(() => window.location.reload(), 500);
        } else {
            output.push(`-bash: ${baseCmd}: command not found. Type "help" for options.`);
        }

        setHistory(prev => [...prev, ...output, '']);
        setInput('');
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div
            ref={containerRef}
            className="w-full h-screen bg-[#0a0a0a] text-[#33ff33] font-mono p-8 overflow-y-auto selection:bg-[#33ff33] selection:text-black border-4 border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
            <div className="max-w-4xl mx-auto space-y-1">
                {history.map((line, i) => (
                    <div key={i} className="min-h-[1.5em] break-words whitespace-pre-wrap">
                        {line.startsWith('root@tooldaddy:~$') ? (
                            <span className="text-[#33ccff] font-bold">{line}</span>
                        ) : line.includes('Error:') ? (
                            <span className="text-red-500">{line}</span>
                        ) : line.startsWith('[') ? (
                            <span className="text-amber-500 font-bold">{line}</span>
                        ) : (
                            line
                        )}
                    </div>
                ))}

                <form onSubmit={handleCommand} className="flex gap-2 items-center pt-2">
                    <span className="text-[#33ccff] font-bold shrink-0">root@tooldaddy:~$</span>
                    <input
                        autoFocus
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 text-[#33ff33] caret-[#33ff33]"
                    />
                </form>
            </div>
            {/* Scanline Effect Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        </div>
    );
}
