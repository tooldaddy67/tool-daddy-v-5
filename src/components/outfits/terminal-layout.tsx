'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TOOL_CATEGORIES, ALL_TOOLS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';

const BANNERS = [
    `
  _____            _   _____            _     _       
 |_   _|__   ___ | | |  __ \\  __ _  __| | __| |_   _ 
   | |/ _ \\ / _ \\| | | |  | |/ _\` |/ _\` |/ _\` | | | |
   | | (_) | (_) | | | |__| | (_| | (_| | (_| | |_| |
   |_|\\___/ \\___/|_| |_____/ \\__,_|\\__,_|\\__,_|\\__, |
                                               |___/ 
    `,
    `
    _________  ____  __       ____  ___    ____  ______  __
   /_  __/ __ \\/ __ \\/ /      / __ \\/   |  / __ \\/ __ \\ \\/ /
    / / / / / / / / / /      / / / / /| | / / / / / / /\\  / 
   / / / /_/ / /_/ / /___   / /_/ / ___ |/ /_/ / /_/ / / /  
  /_/  \\____/\\____/_____/  /_____/_/  |_/_____/_____/_/   
    `
];

const FORTUNES = [
    "A clean desk is a sign of a cluttered desk drawer.",
    "The early bird gets the worm, but the second mouse gets the cheese.",
    "Your focus determines your reality.",
    "01101000 01100001 01100011 01101011 01100101 01110010",
    "Yesterday is history, tomorrow is a mystery, but today is a gift."
];

const THEMES = {
    kali: {
        prompt: '#3465a4', user: '#8ae234', host: '#729fcf', path: '#ad7fa8',
        dir: '#ad7fa8', exe: '#8ae234', error: '#ef2929', info: '#fce94f', cyan: '#06989a'
    },
    matrix: {
        prompt: '#003B00', user: '#00FF41', host: '#008F11', path: '#00FF41',
        dir: '#00FF41', exe: '#00FF41', error: '#FF0000', info: '#00FF41', cyan: '#00FF41'
    },
    dracula: {
        prompt: '#6272a4', user: '#50fa7b', host: '#8be9fd', path: '#bd93f9',
        dir: '#ff79c6', exe: '#50fa7b', error: '#ff5555', info: '#f1fa8c', cyan: '#8be9fd'
    },
    ubuntu: {
        prompt: '#ffffff', user: '#df4a16', host: '#ffffff', path: '#df4a16',
        dir: '#ffffff', exe: '#df4a16', error: '#ef2929', info: '#fce94f', cyan: '#3465a4'
    }
};

export function TerminalLayout() {
    const { user } = useFirebase();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [currentPath, setCurrentPath] = useState('~');
    const [history, setHistory] = useState<string[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [input, setInput] = useState('');
    const [isMatrix, setIsMatrix] = useState(false);
    const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>('kali');

    const colors = THEMES[activeTheme];

    const allTools = useMemo(() => TOOL_CATEGORIES.flatMap(cat => cat.tools), []);

    // Initial message
    useEffect(() => {
        const randomBanner = BANNERS[Math.floor(Math.random() * BANNERS.length)];
        setHistory([
            `\u001b[33m${randomBanner}\u001b[0m`,
            '[*] \u001b[32mStarting Tool Daddy OS v5.0.0 (x86_64)...\u001b[0m',
            '[*] \u001b[36mWelcome to the Advanced Security & Productivity Toolkit.\u001b[0m',
            '[*] System: \u001b[35mKali Linux 2024.1 (rolling release)\u001b[0m',
            '[*] Run "\u001b[33mapt update\u001b[0m" to check for tool updates.',
            '[*] Type "\u001b[33mhelp\u001b[0m" for a list of available commands.',
            '-------------------------------------------------------',
            ''
        ]);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const parts = input.split(' ');
            const lastPart = parts[parts.length - 1];
            if (!lastPart) return;

            const commands = [
                'ls', 'cd', 'run', 'whoami', 'neofetch', 'clear', 'exit', 'man',
                'nmap', 'htop', 'cmatrix', 'apt', 'cat', 'cowsay', 'fortune',
                'theme', 'curl', 'ping', 'hack', 'grep'
            ];
            const categories = TOOL_CATEGORIES.map(c => c.name.replace(/\s+/g, '-'));
            const tools = allTools.map(t => t.name.replace(/\s+/g, '-'));

            const completions = [...commands, ...categories, ...tools]
                .filter(c => c.toLowerCase().startsWith(lastPart.toLowerCase()));

            if (completions.length === 1) {
                parts[parts.length - 1] = completions[0];
                setInput(parts.join(' '));
            } else if (completions.length > 1) {
                setHistory(prev => [...prev, `PROMPT_ROOT ${input}`, `\u001b[36m${completions.join('  ')}\u001b[0m`, '']);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);

        const fullPrompt = `PROMPT_ROOT ${cmd}`;
        let newLines = [fullPrompt];

        const args = cmd.toLowerCase().split(' ');
        const baseCmd = args[0];

        switch (baseCmd) {
            case 'help':
                newLines.push('\u001b[33mAVAILABLE COMMANDS:\u001b[0m');
                newLines.push('  \u001b[32mls | grep [q]\u001b[0m - List and filter tools');
                newLines.push('  \u001b[32mcd [dir]\u001b[0m     - Change directory');
                newLines.push('  \u001b[32mrun [tool]\u001b[0m   - Launch a tool');
                newLines.push('  \u001b[32mapt install\u001b[0m  - Install tool to dashboard');
                newLines.push('  \u001b[35mtheme [name]\u001b[0m - [kali, matrix, dracula, ubuntu]');
                newLines.push('  \u001b[36mcurl [url]\u001b[0m    - [wttr.in/nyc, google.com]');
                newLines.push('  \u001b[36mping [host]\u001b[0m  - Test connectivity');
                newLines.push('  \u001b[31mhack --vault\u001b[0m - Execute security bypass');
                newLines.push('  \u001b[35mneofetch\u001b[0m     - Show system info');
                newLines.push('  \u001b[33mcowsay\u001b[0m       - ASCII Cow speaker');
                newLines.push('  \u001b[31mclear / exit\u001b[0m - Control session');
                break;

            case 'ls':
                const pipeIndex = args.indexOf('|');
                let filter = '';
                if (pipeIndex !== -1 && args[pipeIndex + 1] === 'grep') {
                    filter = args[pipeIndex + 2] || '';
                }

                if (currentPath === '~') {
                    TOOL_CATEGORIES.forEach(cat => {
                        const name = cat.name.replace(/\s+/g, '-');
                        if (!filter || name.toLowerCase().includes(filter.toLowerCase())) {
                            newLines.push(`  drwxr-xr-x  \u001b[35m[${name}]\u001b[0m`);
                        }
                    });
                } else {
                    const category = currentPath.substring(2);
                    const cat = TOOL_CATEGORIES.find(c => c.name.replace(/\s+/g, '-') === category);
                    if (cat) cat.tools.forEach(t => {
                        const name = t.name.replace(/\s+/g, '-');
                        if (!filter || name.toLowerCase().includes(filter.toLowerCase())) {
                            newLines.push(`  -rwxr-xr-x  \u001b[32m${name}\u001b[0m`);
                        }
                    });
                }
                break;

            case 'apt':
                if (args[1] === 'update') {
                    newLines.push('\u001b[33mGet:1 https://api.tooldaddy.com/kali rolling InRelease [125 kB]\u001b[0m');
                    newLines.push('Reading package lists... Done');
                    newLines.push('\u001b[32mAll tools are up to date.\u001b[0m');
                } else if (args[1] === 'install') {
                    const pkg = args[2];
                    if (!pkg) newLines.push('\u001b[31mapt: missing package name\u001b[0m');
                    else {
                        newLines.push(`Reading package lists... Done`);
                        newLines.push(`The following NEW packages will be installed: \u001b[32m${pkg}\u001b[0m`);
                        newLines.push(`[||||||||||||||||||||] 100%`);
                        newLines.push(`\u001b[32mSuccessfully installed ${pkg} to your dashboard.\u001b[0m`);
                    }
                }
                break;

            case 'curl':
                const url = args[1];
                if (url?.includes('wttr.in')) {
                    newLines.push('\u001b[36mWeather report: New York, USA\u001b[0m');
                    newLines.push('     \\   /     Clear');
                    newLines.push('      .-.      +12(10) °C');
                    newLines.push('   ― (   ) ―   ↑ 12 km/h');
                    newLines.push('      `-’      10 km');
                    newLines.push('     /   \\     0.0 mm');
                } else if (url) {
                    newLines.push(`\u001b[33mHTTP/1.1 200 OK\u001b[0m`);
                    newLines.push(`Content-Type: text/html; charset=UTF-8`);
                    newLines.push(`Server: Tool-Daddy-Gateway/1.0`);
                    newLines.push(`\n<title>${url}</title><body><h1>Access Granted</h1></body>`);
                } else newLines.push('\u001b[31mcurl: no URL specified\u001b[0m');
                break;

            case 'ping':
                const host = args[1] || 'google.com';
                newLines.push(`PING ${host} (142.250.190.46): 56 data bytes`);
                for (let i = 1; i <= 3; i++) {
                    newLines.push(`64 bytes from 142.250.190.46: icmp_seq=${i} ttl=57 time=${Math.floor(Math.random() * 20 + 10)} ms`);
                }
                newLines.push(`--- ${host} ping statistics ---`);
                newLines.push('3 packets transmitted, 3 packets received, 0.0% packet loss');
                break;

            case 'theme':
                const newTheme = args[1] as keyof typeof THEMES;
                if (THEMES[newTheme]) {
                    setActiveTheme(newTheme);
                    newLines.push(`\u001b[32m[+] Switching to ${newTheme.toUpperCase()} theme...\u001b[0m`);
                } else {
                    newLines.push(`\u001b[31mUnknown theme.\u001b[0m Available: ${Object.keys(THEMES).join(', ')}`);
                }
                break;

            case 'hack':
                if (args[1] === '--vault') {
                    newLines.push('\u001b[31m[!] INITIATING SECURE ENCLAVE BYPASS...\u001b[0m');
                    newLines.push('[*] Cracking SSL/TLS Handshake... \u001b[32mOK\u001b[0m');
                    newLines.push('[*] Injecting SQL Payload... \u001b[32mOK\u001b[0m');
                    newLines.push('[*] Escaping Sandbox... \u001b[32mOK\u001b[0m');
                    newLines.push('\n\u001b[33m      ACCESS GRANTED\u001b[0m');
                    newLines.push('   _______________________');
                    newLines.push('  |  ___________________  |');
                    newLines.push('  | | DATA DECRYPTED    | |');
                    newLines.push('  | | [X] [X] [X] [X]   | |');
                    newLines.push('  | |___________________| |');
                    newLines.push('  |_______________________|');
                } else newLines.push('Usage: hack --vault');
                break;

            case 'cd':
                const target = args[1];
                if (!target || target === '~' || target === '..') {
                    setCurrentPath('~');
                } else {
                    const normalized = target.replace(/[\[\]]/g, '');
                    const cat = TOOL_CATEGORIES.find(c => c.name.replace(/\s+/g, '-').toLowerCase() === normalized.toLowerCase());
                    if (cat) setCurrentPath(`~/${cat.name.replace(/\s+/g, '-')}`);
                    else newLines.push(`\u001b[31mcd: no such directory: ${target}\u001b[0m`);
                }
                break;

            case 'run':
                const toolName = args[1];
                const tool = allTools.find(t => t.name.replace(/\s+/g, '-').toLowerCase() === toolName?.toLowerCase());
                if (tool) {
                    newLines.push(`\u001b[32m[+] Executing binary: ${tool.name}...\u001b[0m`);
                    setTimeout(() => router.push(tool.href), 1000);
                } else newLines.push(`\u001b[31mrun: tool not found: ${toolName}\u001b[0m`);
                break;

            case 'man':
            case 'cat':
                const mToolName = args[1];
                const mTool = allTools.find(t => t.name.replace(/\s+/g, '-').toLowerCase() === mToolName?.toLowerCase());
                if (mTool) {
                    newLines.push(`\u001b[33m${mTool.name.toUpperCase()}(1)\u001b[0m - User Manual`);
                    newLines.push(`\n\u001b[32mNAME:\u001b[0m ${mTool.name}`);
                    newLines.push(`\u001b[32mDESCRIPTION:\u001b[0m ${mTool.description}`);
                    newLines.push(`\u001b[36mPATH:\u001b[0m /usr/bin/${mTool.href.split('/').pop()}`);
                    newLines.push(`\u001b[35mDEPENDENCIES:\u001b[0m next.js, tailwind, lucide-react`);
                } else newLines.push(`\u001b[31mNo manual entry for ${mToolName}\u001b[0m`);
                break;

            case 'nmap':
                newLines.push('\u001b[36mStarting Nmap 7.94 ( https://nmap.org ) at 2024-02-24\u001b[0m');
                newLines.push('Nmap scan report for tooldaddy.local (127.0.0.1)');
                newLines.push('\u001b[33mPORT     STATE  SERVICE\u001b[0m');
                TOOL_CATEGORIES.forEach((c, i) => {
                    newLines.push(`${8000 + i}/tcp  \u001b[32mopen\u001b[0m   ${c.name.replace(/\s+/g, '-').toLowerCase()}`);
                });
                newLines.push('\nNmap done: 1 IP address (1 host up) scanned');
                break;

            case 'htop':
                newLines.push('\u001b[32mCPU\u001b[0m [\u001b[31m|||||||||||||||||||||||||||||||\u001b[0m 87.2%]   Tasks: 42, 11 running');
                newLines.push('\u001b[36mMem\u001b[0m [\u001b[32m|||||||||||||||\u001b[0m 4.2G/16.0G]          Load average: 0.12 0.08 0.05');
                newLines.push('\n  \u001b[33mPID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command\u001b[0m');
                newLines.push('  102 root       20   0  1.2G  150M  45M S  8.5  1.2  0:42.12 next-dev');
                newLines.push('  501 t-daddy    20   0  850M   92M  32M S  2.1  0.8  0:15.05 tool-daddy-terminal');
                break;

            case 'cmatrix':
                setIsMatrix(true);
                setTimeout(() => setIsMatrix(false), 5000);
                newLines.push('\u001b[32m[*] Matrix overlay activated for 5 seconds...\u001b[0m');
                break;

            case 'cowsay':
                const msg = args.slice(1).join(' ') || 'Hello World!';
                const line = '-'.repeat(msg.length + 2);
                newLines.push(`  \u001b[33m${line}\u001b[0m`);
                newLines.push(` \u001b[32m< ${msg} >\u001b[0m`);
                newLines.push(`  \u001b[33m${line}\u001b[0m`);
                newLines.push('        \\   ^__^');
                newLines.push('         \\  (oo)\\_______');
                newLines.push('            (__)\\       )\\/\\');
                newLines.push('                ||----w |');
                newLines.push('                ||     ||');
                break;

            case 'fortune':
                newLines.push(`\u001b[36m${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}\u001b[0m`);
                break;

            case 'neofetch':
                newLines.push('               ..,  ');
                newLines.push('           .cxO000Ox;   \u001b[32mOS:\u001b[0m Kali Linux 2024.1');
                newLines.push('        .cx0000000000O; \u001b[33mHost:\u001b[0m Browser');
                newLines.push(`     .cx000000000000000; \u001b[34mUptime:\u001b[0m ${Math.floor(performance.now() / 60000)}m`);
                newLines.push(`   .cx00000000000000000; \u001b[35mShell:\u001b[0m tooldaddy-sh 5.0`);
                newLines.push(`  .cx000000000000000000; \u001b[36mPackages:\u001b[0m ${allTools.length}`);
                newLines.push(' .cx0000000000000000000; \u001b[32mUI:\u001b[0m Retro-Terminal');
                newLines.push(`  .cx000000000000000000; \u001b[31mRAM:\u001b[0m ${Math.floor(Math.random() * 8 + 4)}GB / 16GB`);
                break;

            case 'whoami':
                newLines.push(`\u001b[32mUSER:\u001b[0m ${user?.displayName || 'Guest'}`);
                newLines.push(`\u001b[36mSHELL:\u001b[0m /bin/zsh`);
                break;

            case 'clear':
                setHistory([]);
                setInput('');
                return;

            case 'exit':
                window.location.reload();
                return;

            default:
                newLines.push(`\u001b[31mzsh: command not found: ${baseCmd}\u001b[0m`);
        }

        setHistory(prev => [...prev, ...newLines, '']);
        setInput('');
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [history]);

    const renderLine = (line: string) => {
        if (line.startsWith('PROMPT_ROOT')) {
            const cmdText = line.substring(11).trim();
            return (
                <div className="flex flex-col">
                    <span className="font-bold flex gap-1">
                        <span style={{ color: colors.prompt }}>┌──(</span>
                        <span style={{ color: colors.user }}>t-daddy㉿kali</span>
                        <span style={{ color: colors.prompt }}>)-[</span>
                        <span style={{ color: colors.path }}>{currentPath}</span>
                        <span style={{ color: colors.prompt }}>]</span>
                    </span>
                    <span className="font-bold flex gap-2">
                        <span style={{ color: colors.prompt }}>└─$</span>
                        <span className="text-white">{cmdText}</span>
                    </span>
                </div>
            )
        }

        // Basic ANSI simulation - fixed parser logic
        const parts = line.split(/(\u001b\[\d+m)/);
        let currentStyle: React.CSSProperties = {};

        return (
            <div className="min-h-[1.2em] break-words whitespace-pre-wrap">
                {parts.map((part, i) => {
                    if (part.startsWith('\u001b[')) {
                        const code = part.match(/\d+/)?.[0];
                        if (code === '0') currentStyle = {};
                        else if (code === '31') currentStyle = { color: colors.error };
                        else if (code === '32') currentStyle = { color: colors.user };
                        else if (code === '33') currentStyle = { color: colors.info };
                        else if (code === '34') currentStyle = { color: colors.host };
                        else if (code === '35') currentStyle = { color: colors.path };
                        else if (code === '36') currentStyle = { color: colors.cyan };
                        return null;
                    }
                    return <span key={i} style={{ ...currentStyle }}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            onClick={() => inputRef.current?.focus()}
            className="w-full h-[calc(100vh-64px)] bg-[#1a1a1a] text-[#c5c5c5] font-mono p-10 overflow-y-auto selection:bg-[#3465a4] selection:text-white relative"
        >
            <div className="w-full space-y-0.5 relative z-10 transition-opacity duration-1000" style={{ opacity: isMatrix ? 0.2 : 1 }}>
                {history.map((line, i) => (
                    <React.Fragment key={i}>
                        {renderLine(line)}
                    </React.Fragment>
                ))}

                <form onSubmit={handleCommand} className="flex flex-col pt-2">
                    <span className="font-bold flex gap-1">
                        <span style={{ color: colors.prompt }}>┌──(</span>
                        <span style={{ color: colors.user }}>t-daddy㉿kali</span>
                        <span style={{ color: colors.prompt }}>)-[</span>
                        <span style={{ color: colors.path }}>{currentPath}</span>
                        <span style={{ color: colors.prompt }}>]</span>
                    </span>
                    <div className="flex gap-2 items-center">
                        <span style={{ color: colors.prompt }} className="font-bold shrink-0">└─$</span>
                        <input
                            ref={inputRef}
                            autoFocus
                            type="text"
                            value={input}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 text-white caret-white"
                        />
                    </div>
                </form>
            </div>

            {/* Matrix Rain Effect Overlay - Fixed visibility and animation */}
            {isMatrix && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100] bg-black/60 flex justify-around">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col text-[#00ff41] text-xs font-bold leading-none animate-matrix-rain"
                            style={{
                                animationDuration: `${2 + Math.random() * 3}s`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.4 + Math.random() * 0.6
                            }}
                        >
                            {Array.from({ length: 40 }).map((_, j) => (
                                <span key={j} className="py-0.5">{String.fromCharCode(0x30A0 + Math.random() * 96)}</span>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes matrixRain {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-matrix-rain {
                    animation: matrixRain linear infinite;
                }
            `}</style>

            {/* Subtle Screen Scanline */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
}
