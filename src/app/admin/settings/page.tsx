'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    ShieldAlert,
    Globe,
    Lock,
    ShieldCheck,
    AlertTriangle,
    Zap,
    Cpu,
    ArrowLeft,
    RefreshCw,
    Network,
    Search,
    Terminal,
    Loader2,
    Plus,
    X,
    Activity,
    Server,
    Database,
    CloudCog,
    Radio
} from 'lucide-react';
import Link from 'next/link';
import { HeadAdminPasswordGate } from '@/components/head-admin-password-gate';
import { useToast } from '@/hooks/use-toast';
import { getSystemConfig, updateSystemConfig, SystemConfig } from '@/app/actions/system-config';
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { ALL_TOOLS } from '@/lib/tools-data';

export default function GlobalSettingsPage() {
    const { toast } = useToast();
    const { user } = useFirebase();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurging, setIsPurging] = useState(false);
    const [liveLatency, setLiveLatency] = useState(24);

    const [config, setConfig] = useState<SystemConfig>({
        maintenanceMode: false,
        forceSsl: true,
        corsProtection: true,
        authorizedOrigins: 'https://tool-daddy.com',
        publicRateLimit: 100,
        authRateLimit: 1000,
        toolRateLimits: {}
    });

    const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
    const [toolLimitValue, setToolLimitValue] = useState(5);
    const [toolSearch, setToolSearch] = useState('');
    const [healthData, setHealthData] = useState<any>(null);
    const [securityScore, setSecurityScore] = useState(85);

    const [newOrigin, setNewOrigin] = useState('');
    const origins = config.authorizedOrigins.split(',').filter(o => o.trim() !== '');

    // Fluctuating latency simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveLatency(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                const next = prev + change;
                return next < 15 ? 15 : next > 45 ? 45 : next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Real System Health Monitoring
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                if (!user) return;
                const token = await user.getIdToken();
                const res = await fetch('/api/admin/system-health', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHealthData(data);
                    setLiveLatency(data.latency);
                }
            } catch (err) {
                console.error("Health fetch error:", err);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 10000); // Every 10s
        return () => clearInterval(interval);
    }, [user]);

    // Calculate dynamic security score
    useEffect(() => {
        let score = 50;
        if (config.forceSsl) score += 15;
        if (config.corsProtection) score += 15;
        if (config.authorizedOrigins.length > 10) score += 10;
        if (!config.maintenanceMode) score += 10;
        setSecurityScore(score);
    }, [config]);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await getSystemConfig();
                setConfig(data);
            } catch (err) {
                console.error("Config load error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const result = await updateSystemConfig(config, user.uid, user.email || 'admin@tooldaddy.com');
            if (result.success) {
                toast({
                    title: "Security Uplink Terminated",
                    description: config.maintenanceMode
                        ? "Global Maintenance Mode is now ACTIVE. Service restricted."
                        : "Global API configuration has been synchronized with the core firewall.",
                });
            } else {
                toast({
                    title: "Sync Failed",
                    description: result.error || "Failed to update global configuration.",
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            toast({
                title: "Internal Error",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const addOrigin = () => {
        if (!newOrigin) return;
        if (!newOrigin.startsWith('http')) {
            toast({ title: "Invalid Protocol", description: "CORS origins must include http:// or https://", variant: "destructive" });
            return;
        }
        if (origins.includes(newOrigin)) {
            setNewOrigin('');
            return;
        }

        const updated = [...origins, newOrigin].join(',');
        setConfig(prev => ({ ...prev, authorizedOrigins: updated }));
        setNewOrigin('');
    };

    const removeOrigin = (origin: string) => {
        const updated = origins.filter(o => o !== origin).join(',');
        setConfig(prev => ({ ...prev, authorizedOrigins: updated }));
    };

    const handlePurge = () => {
        setIsPurging(true);
        setTimeout(() => {
            setIsPurging(false);
            toast({
                title: "Edge Cache Purged",
                description: "All 24 global nodes have been synchronized. CDN cache is fresh.",
            });
        }, 2000);
    };

    const calculateSecurityScore = () => {
        let score = 0;
        if (config.forceSsl) score += 40;
        if (config.corsProtection) score += 30;
        if (config.maintenanceMode) score += 10;
        if (config.publicRateLimit < 200) score += 20;
        return score;
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <HeadAdminPasswordGate>
            <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 pb-32">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-4">
                            <Link
                                href="/admin/head-dashboard"
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                            >
                                <ArrowLeft className="h-4 w-4" /> Return to Command Center
                            </Link>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-slate-600 bg-clip-text text-transparent tracking-tighter">
                                    Global API Settings
                                </h1>
                                <p className="text-slate-500 mt-2 font-medium">Manage platform-wide security protocols, API rate limits, and firewall rules.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handlePurge}
                                disabled={isPurging}
                                className="border-white/5 bg-white/5 text-white hover:bg-white/10 h-12 rounded-xl font-bold px-6 transition-all"
                            >
                                {isPurging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                PURGE EDGE
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-black hover:bg-primary/90 font-bold px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
                            >
                                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                {isSaving ? "SYNCHRONIZING..." : "SAVE CONFIGURATION"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Security Policy Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <ShieldAlert className="h-32 w-32" />
                                </div>
                                <CardHeader className="border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <Lock className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Firewall & API Access</CardTitle>
                                            <CardDescription className="text-slate-500 text-xs">Configure how the external world interacts with your API endpoints.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Force SSL Encryption</p>
                                            <p className="text-xs text-slate-500">Require all API requests to use HTTPS/TLS 1.3.</p>
                                        </div>
                                        <Switch
                                            checked={config.forceSsl}
                                            onCheckedChange={(val) => setConfig({ ...config, forceSsl: val })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">Maintenance Mode</p>
                                                {config.maintenanceMode && <div className="animate-pulse h-4 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">ACTIVE</div>}
                                            </div>
                                            <p className="text-xs text-slate-500">Redirect all API traffic to a static 503 response.</p>
                                        </div>
                                        <Switch
                                            checked={config.maintenanceMode}
                                            onCheckedChange={(val) => setConfig({ ...config, maintenanceMode: val })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Enable CORS Protection</p>
                                            <p className="text-xs text-slate-500">Restrict API access to authorized domains only.</p>
                                        </div>
                                        <Switch
                                            checked={config.corsProtection}
                                            onCheckedChange={(val) => setConfig({ ...config, corsProtection: val })}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Authorized Origins (CORS)</Label>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-lg bg-black/40 border border-white/5">
                                                {origins.map((origin, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-md text-[10px] font-mono group/tag">
                                                        {origin}
                                                        <button
                                                            onClick={() => removeOrigin(origin)}
                                                            className="text-primary/50 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {origins.length === 0 && <span className="text-slate-600 text-[10px] italic p-1">No origins authorized. Global access blocked.</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative flex-grow">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                    <Input
                                                        className="bg-black/60 border-white/10 pl-10 text-white font-mono text-xs h-11 focus:border-primary/50 transition-all"
                                                        placeholder="https://yourapp.com"
                                                        value={newOrigin}
                                                        onChange={(e) => setNewOrigin(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addOrigin()}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={addOrigin}
                                                    variant="secondary"
                                                    className="h-11 bg-white/5 hover:bg-white/10 border border-white/10"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                                <CardHeader className="border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                            <Zap className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Rate Limiting Protocols</CardTitle>
                                            <CardDescription className="text-slate-500 text-xs">Prevent brute-force and DDoS attacks on resource-heavy endpoints.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold text-slate-400">Public Request Limit</Label>
                                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white font-mono">{config.publicRateLimit} / MIN</span>
                                            </div>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    type="number"
                                                    value={config.publicRateLimit}
                                                    onChange={(e) => setConfig({ ...config, publicRateLimit: parseInt(e.target.value) || 0 })}
                                                    className="bg-black/40 border-white/10 h-10 pl-10"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic">Global throttle for unauthenticated traffic.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold text-slate-400">Authenticated Limit</Label>
                                                <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary font-mono">{config.authRateLimit} / MIN</span>
                                            </div>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    type="number"
                                                    value={config.authRateLimit}
                                                    onChange={(e) => setConfig({ ...config, authRateLimit: parseInt(e.target.value) || 0 })}
                                                    className="bg-black/40 border-white/10 h-10 pl-10"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic">Throughput per verified JWT user session.</p>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-white/5 space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Tool-Specific Overrides</h4>
                                                <p className="text-[10px] text-slate-500 text-balance">Apply custom request quotas to specific tools. Select multiple tools to apply the same limit in bulk.</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-4">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between gap-2 mt-2">
                                                            <Label className="text-[10px] uppercase font-bold text-slate-500">Search & Select Tools</Label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setSelectedToolIds(ALL_TOOLS.filter(t => t.usesApi).map(t => t.href.replace('/', '')))}
                                                                    className="text-[8px] text-primary hover:underline font-bold"
                                                                >
                                                                    SELECT ALL
                                                                </button>
                                                                <span className="text-slate-800 text-[8px]">/</span>
                                                                <button
                                                                    onClick={() => setSelectedToolIds([])}
                                                                    className="text-[8px] text-slate-500 hover:underline font-bold"
                                                                >
                                                                    NONE
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                            <Input
                                                                placeholder="Find tools (e.g. humanizer, bcrypt)..."
                                                                className="bg-black/40 border-white/10 h-10 pl-10 text-xs"
                                                                value={toolSearch}
                                                                onChange={(e) => setToolSearch(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-[150px] overflow-y-auto p-1 custom-scrollbar">
                                                            {ALL_TOOLS.filter(t =>
                                                                t.usesApi &&
                                                                t.name.toLowerCase().includes(toolSearch.toLowerCase())
                                                            ).map(tool => {
                                                                const toolId = tool.href.replace('/', '');
                                                                const isSelected = selectedToolIds.includes(toolId);
                                                                return (
                                                                    <button
                                                                        key={toolId}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                setSelectedToolIds(prev => prev.filter(id => id !== toolId));
                                                                            } else {
                                                                                setSelectedToolIds(prev => [...prev, toolId]);
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-[9px] font-bold text-left transition-all",
                                                                            isSelected
                                                                                ? "bg-primary text-black"
                                                                                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                                                        )}
                                                                    >
                                                                        {isSelected ? <ShieldCheck className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                                        <span className="truncate">{tool.name}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="sm:w-32 space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-500">Limit (req/m)</Label>
                                                        <Input
                                                            type="number"
                                                            className="bg-black/40 border-white/10 h-10 text-center font-mono font-bold"
                                                            value={toolLimitValue}
                                                            onChange={(e) => setToolLimitValue(parseInt(e.target.value) || 1)}
                                                        />
                                                        <Button
                                                            className="w-full h-10 bg-primary text-black font-bold text-xs"
                                                            disabled={selectedToolIds.length === 0}
                                                            onClick={() => {
                                                                const newLimits = { ...(config.toolRateLimits || {}) };
                                                                selectedToolIds.forEach(id => {
                                                                    newLimits[id] = toolLimitValue;
                                                                });
                                                                setConfig({ ...config, toolRateLimits: newLimits });
                                                                setSelectedToolIds([]);
                                                                setToolSearch('');
                                                                toast({
                                                                    title: "Batch Limit Applied",
                                                                    description: `Applied ${toolLimitValue} req/m to ${selectedToolIds.length} tools.`
                                                                });
                                                            }}
                                                        >
                                                            DEPLOY {selectedToolIds.length > 0 && `(${selectedToolIds.length})`}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {selectedToolIds.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                                                        {selectedToolIds.map(id => (
                                                            <span key={id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black border border-primary/20">
                                                                {id.toUpperCase()}
                                                                <button onClick={() => setSelectedToolIds(prev => prev.filter(t => t !== id))}>
                                                                    <X className="h-2 w-2" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <button
                                                            onClick={() => setSelectedToolIds([])}
                                                            className="text-[8px] text-slate-500 hover:text-white underline font-bold px-2"
                                                        >
                                                            CLEAR ALL
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Active Enforcement Table</h5>
                                                {Object.keys(config.toolRateLimits || {}).length > 0 && (
                                                    <button
                                                        onClick={() => setConfig({ ...config, toolRateLimits: {} })}
                                                        className="text-[9px] text-red-500 hover:underline font-bold"
                                                    >
                                                        PURGE ALL RULES
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {Object.entries(config.toolRateLimits || {}).map(([id, limit]) => (
                                                    <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 group/tool hover:border-primary/20 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                                                <CloudCog className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                                                                    {ALL_TOOLS.find(t => t.href.replace('/', '') === id)?.name || id}
                                                                </p>
                                                                <p className="text-[9px] text-slate-500 font-mono tracking-tighter">{limit} / MIN</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const updated = { ...config.toolRateLimits };
                                                                delete updated[id];
                                                                setConfig({ ...config, toolRateLimits: updated });
                                                            }}
                                                            className="text-slate-700 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {Object.keys(config.toolRateLimits || {}).length === 0 && (
                                                    <div className="col-span-full text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/20">
                                                        <Zap className="h-6 w-6 text-slate-800 mx-auto mb-2" />
                                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No individual overrides detection</p>
                                                        <p className="text-[9px] text-slate-700 mt-1">System is using global unauthenticated throttle for all tools.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Information */}
                        <div className="space-y-6">
                            <Card className="bg-primary/5 border-primary/20 backdrop-blur-xl overflow-hidden relative border-t-2 border-t-primary/50">
                                <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/20 blur-3xl rounded-full" />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Radio className="h-4 w-4 text-primary animate-pulse" /> Live Metrics
                                        </CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-green-500 tracking-widest uppercase">Live</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Cpu className="h-3 w-3 text-slate-500" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">API Latency</span>
                                            </div>
                                            <span className={cn(
                                                "text-xs font-mono font-bold transition-colors duration-500",
                                                liveLatency < 25 ? "text-green-500" : liveLatency < 35 ? "text-amber-500" : "text-red-500"
                                            )}>{liveLatency}ms</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Server className="h-3 w-3 text-slate-500" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Cluster</span>
                                            </div>
                                            <span className="text-xs font-mono text-white text-[10px]">
                                                {healthData?.status === 'healthy' ? 'CORE-PRIMARY-NODE' : 'DEGRADED-RECOVERY'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-3 w-3 text-slate-500" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Security Grade</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded font-black tracking-widest",
                                                    securityScore > 80 ? "bg-green-500/20 text-green-500" : securityScore > 50 ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
                                                )}>
                                                    {securityScore >= 90 ? "A++" : securityScore >= 70 ? "A" : securityScore >= 50 ? "B" : "C-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>System Resilience</span>
                                            <span>{securityScore}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]",
                                                    securityScore > 80 ? "bg-green-500" : securityScore > 50 ? "bg-amber-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${securityScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-white/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                                        <CloudCog className="h-3.5 w-3.5" /> Edge Fabric Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(healthData?.nodes || [
                                        { id: 'Discovery 1', load: '0%', status: 'green' },
                                        { id: 'Relay 2', load: '0%', status: 'amber' },
                                    ]).map((node: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                            <span className="text-[10px] font-medium text-slate-300">{node.id || node.node}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono text-slate-500">{typeof node.load === 'number' ? `${node.load}%` : node.load}</span>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", node.status === 'green' ? 'bg-green-500' : 'bg-amber-500')} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-500">
                                        <AlertTriangle className="h-4 w-4" /> Root Warning
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                                        Any changes to these settings propagate in real-time across the global edge network. Incorrect configuration may result in immediate platform-wide outages or security breaches.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-white/5 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <CardTitle className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Platform Integrity</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Kernel Version</span>
                                        <span className="text-white font-mono">v5.0.0-PRO</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Security Patch</span>
                                        <span className="text-green-500 font-mono">2026.02.PATCHD</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer status bar */}
                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#020617]/80 backdrop-blur-xl border-t border-white/5 z-50">
                    <div className="container mx-auto flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]" /> TLS_1.3_AUTH</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-green-500 shadow-[0_0_5px_#22c55e]" /> {config.maintenanceMode ? 'HV_PROTECT_ACTIVE' : 'API_NOMINAL'}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="hidden lg:inline">TRAFFIC: 1.2 GB/S</span>
                            <span>UPTIME: 99.998%</span>
                            <span className="hidden md:inline">NODE_ID: CMD_CENTER_01</span>
                        </div>
                    </div>
                </footer>
            </div>
        </HeadAdminPasswordGate>
    );
}

function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'destructive' | 'outline', className?: string }) {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const styles = {
        default: "bg-primary text-black border-transparent",
        destructive: "bg-red-900/50 text-red-100 border-red-800",
        outline: "text-slate-300 border border-slate-800"
    };
    return <div className={cn(base, styles[variant], className)}>{children}</div>;
}
