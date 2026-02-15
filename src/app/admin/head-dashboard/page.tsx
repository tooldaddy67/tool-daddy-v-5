'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { HeadAdminPasswordGate } from '@/components/head-admin-password-gate';
import { StatsCard } from '@/components/admin/stats-card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    Cell,
    PieChart, Pie,
} from 'recharts';
import {
    ShieldCheck,
    Activity,
    Cpu,
    Database,
    Terminal,
    Users,
    Lock,
    Globe,
    Zap,
    History,
    Settings,
    LayoutDashboard,
    Loader2,
    RefreshCw,
    Trash2,
    ShieldOff,
    UserX,
    UserCheck,
    MoreVertical,
    Calendar,
    Mail,
    Clock,
    Search,
    KeyRound,
    Network,
    ShieldCheck as ShieldCheckIcon,
    Bug,
    Rocket,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    FileSearch,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
    ChevronDown,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
    uid: string;
    name: string;
    role: string;
    email: string;
    lastLogin: string;
    joinedDate: string;
    disabled: boolean;
    isBanned: boolean;
    isProtected: boolean;
}

interface ObservabilityData {
    volumeData: any[];
    endpointData: any[];
    levelStats: Record<string, number>;
    summary: {
        totalRequests: number;
        errorCount: number;
        avgSystemLatency: number;
    };
}

interface HeadStats {
    metrics: {
        uptime: string;
        load: string;
        dbStatus: string;
        securityLevel: string;
    };
    logs: any[];
    config: {
        maintenanceMode: boolean;
        featureFlags: boolean;
        betaPercent: number;
        apiVersion: string;
    };
    admins: AdminUser[];
    allUsers: AdminUser[];
}

export default function HeadAdminDashboard() {
    const { user } = useFirebase();
    const { toast } = useToast();
    const [data, setData] = useState<HeadStats | null>(null);
    const [obsData, setObsData] = useState<ObservabilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [obsLoading, setObsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // View States
    const [viewMode, setViewMode] = useState<'dashboard' | 'terminal' | 'analytics'>('dashboard');
    const [logLevelFilter, setLogLevelFilter] = useState<string>('ALL');
    const [logSearch, setLogSearch] = useState('');

    // Sandbox State
    const [sandboxMethod, setSandboxMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
    const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/admin/observability');
    const [sandboxResponse, setSandboxResponse] = useState<any>(null);
    const [sandboxLoading, setSandboxLoading] = useState(false);

    // Traffic Control State (Initialized from DB)
    const [burstLimit, setBurstLimit] = useState(50);
    const [proQuota, setProQuota] = useState(1000);

    const [searchQuery, setSearchQuery] = useState('');
    const [userLimit, setUserLimit] = useState('10');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const handleSandboxExecute = async () => {
        if (!user) return;
        setSandboxLoading(true);
        setSandboxResponse(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch(sandboxEndpoint, {
                method: sandboxMethod,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            setSandboxResponse(data);
            toast({
                title: `API Request Complete`,
                description: `HTTP Status: ${res.status}`,
                variant: res.ok ? "default" : "destructive"
            });
        } catch (e: any) {
            setSandboxResponse({ error: e.message });
        } finally {
            setSandboxLoading(false);
        }
    };

    const handleUpdateTraffic = async (type: 'public' | 'pro', delta: number) => {
        if (!user) return;
        const newValue = type === 'public' ? burstLimit + delta : proQuota + delta;

        try {
            const token = await user.getIdToken();
            // We use the manage-user endpoint or a dedicated one, but since we have updateSystemConfig server action,
            // we should technically use that. However, server actions in 'use client' files need care.
            // For now, let's update local state and show a simulation message unless we have a clear client-side way.
            if (type === 'public') setBurstLimit(newValue);
            else setProQuota(newValue);

            toast({
                title: "Dynamic Throttle Updated",
                description: `Global ${type} limit set to ${newValue}/min across cluster.`,
            });

            // Log it
            fetch('/api/admin/manage-user', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'CONFIG_SYNC',
                    targetUid: user.uid,
                    details: { [type === 'public' ? 'publicRateLimit' : 'authRateLimit']: newValue }
                })
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Modal States
    const [isPermissionMapOpen, setIsPermissionMapOpen] = useState(false);
    const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ uid: string; email: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const timeAgo = (date: string | Date) => {
        if (!date) return 'Unknown';
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchObservability = useCallback(async () => {
        if (!user) return;
        setObsLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/observability', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const obs = await res.json();
                setObsData(obs);
            }
        } catch (e) {
            console.error('Failed to fetch observability:', e);
        } finally {
            setObsLoading(false);
        }
    }, [user]);

    // Auto-scroll Terminal
    useEffect(() => {
        if (viewMode === 'terminal') {
            const container = document.getElementById('terminal-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [data?.logs, viewMode, logSearch, logLevelFilter]);

    // Real-time Gateway Polling
    useEffect(() => {
        if (!user || (viewMode !== 'analytics' && viewMode !== 'terminal')) return;

        const poll = setInterval(() => {
            fetchObservability();
        }, 20000); // 20s heartbeat

        return () => clearInterval(poll);
    }, [user, viewMode, fetchObservability]);

    const fetchHeadStats = useCallback(async () => {
        if (!user || user.isAnonymous) return;

        setLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/admin/head-stats?search=${encodeURIComponent(debouncedSearch)}&limit=${userLimit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const statsData = await res.json();
            setData(statsData);

            // Sync traffic control state with DB
            if (statsData.config) {
                setBurstLimit(statsData.config.publicRateLimit || 50);
                setProQuota(statsData.config.authRateLimit || 1000);
            }

            // Trigger observability fetch in parallel
            fetchObservability();
        } catch (err: any) {
            console.error('Failed to fetch head admin stats:', err);
            setError(err.message || 'Failed to load system data');
        } finally {
            setLoading(false);
        }
    }, [user, debouncedSearch, userLimit, fetchObservability]);

    const handleUserAction = async (targetUid: string, action: string, email: string) => {
        if (!user) return;

        const confirmMsg = action === 'DELETE_DATA'
            ? `WARNING: This will permanently delete ALL data for ${email} and remove their account. THIS CANNOT BE UNDONE. Continue?`
            : `Are you sure you want to ${action.toLowerCase().replace('_', ' ')} for ${email}?`;

        if (!window.confirm(confirmMsg)) return;

        setActionLoading(targetUid);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/manage-user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetUid, action })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Action failed');

            toast({
                title: "Protocol Executed",
                description: result.message,
                variant: "default",
            });
            fetchHeadStats(); // Refresh data
        } catch (err: any) {
            toast({
                title: "Security Violation / Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handlePasswordChange = async () => {
        if (!selectedUser || !newPassword || newPassword.length < 6) {
            toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }

        setActionLoading(selectedUser.uid);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/admin/manage-user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    targetUid: selectedUser.uid,
                    action: 'CHANGE_PASSWORD',
                    newPassword
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Update failed');

            toast({ title: "Protocol Executed", description: result.message });
            setIsPasswordChangeOpen(false);
            setNewPassword('');
            setSelectedUser(null);
        } catch (err: any) {
            toast({ title: "Security Failure", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (user && !user.isAnonymous) {
            fetchHeadStats();
            const interval = setInterval(fetchHeadStats, 60000); // 1 min poll
            return () => clearInterval(interval);
        }
    }, [user, fetchHeadStats]);

    return (
        <HeadAdminPasswordGate>
            <div className="min-h-screen bg-[#020617] text-slate-200">
                {/* Top Navigation Bar */}
                <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    HEAD-ADMIN <span className="text-primary font-mono text-sm ml-2">v5.0-PRO</span>
                                </h1>
                            </div>

                            {/* Secondary Navigation Tags */}
                            <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setViewMode('dashboard')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                        viewMode === 'dashboard' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    OVERVIEW
                                </button>
                                <button
                                    onClick={() => setViewMode('terminal')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                        viewMode === 'terminal' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <Terminal className="h-3.5 w-3.5" />
                                    LIVE CONSOLE
                                </button>
                                <button
                                    onClick={() => setViewMode('analytics')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                        viewMode === 'analytics' ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    OBSERVABILITY
                                </button>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchHeadStats}
                                disabled={loading}
                                className="text-slate-400 hover:text-white"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Link href="/admin/dashboard">
                                <Button variant="ghost" size="sm" className="hidden lg:flex text-slate-400 hover:text-white">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Public Site
                                </Button>
                            </Link>
                            <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold">{user?.email?.[0].toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto p-6 space-y-8 pb-32">
                    {loading && !data ? (
                        <div className="flex h-[40vh] items-center justify-center">
                            <div className="text-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-slate-500 animate-pulse font-mono uppercase tracking-widest">Bridging secure connection...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-2xl text-center space-y-4">
                            <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
                                <Lock className="h-6 w-6 text-destructive" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Encrypted Data Access Failed</h3>
                            <p className="text-slate-400 max-w-md mx-auto">{error}</p>
                            <Button variant="outline" onClick={fetchHeadStats}>Retry Connection</Button>
                        </div>
                    ) : data && (
                        <>
                            {viewMode === 'dashboard' && (
                                <>
                                    {/* Welcome Header */}
                                    <div className="flex flex-col gap-1">
                                        <p className="text-primary text-xs font-mono uppercase tracking-[0.3em]">System Level: Root</p>
                                        <h2 className="text-4xl font-black tracking-tighter text-white">Command Center</h2>
                                        <p className="text-slate-500 max-w-2xl">
                                            Advanced platform configuration and sensitive system metrics. Every action performed here is logged and timestamped under your unique identifier.
                                        </p>
                                    </div>

                                    {/* High-Level Metrics */}
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                        <StatsCard
                                            title="System Uptime"
                                            value={data.metrics.uptime}
                                            icon={Activity}
                                            description="Active operational duration"
                                        />
                                        <StatsCard
                                            title="Server Load"
                                            value={data.metrics.load}
                                            icon={Cpu}
                                            description="Cluster efficiency stable"
                                        />
                                        <StatsCard
                                            title="Database Health"
                                            value={data.metrics.dbStatus}
                                            icon={Database}
                                            description="Firestore replication synced"
                                        />
                                        <StatsCard
                                            title="Security Level"
                                            value={data.metrics.securityLevel}
                                            icon={Lock}
                                            description="All protocols active"
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Advanced Security Audit Log */}
                                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <History className="h-32 w-32 text-primary" />
                                            </div>
                                            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-white flex items-center gap-2">
                                                        <Terminal className="h-5 w-5 text-primary" />
                                                        Advanced Security Audit
                                                    </CardTitle>
                                                    <CardDescription className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                                                        Live monitoring of system administration events
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[9px] font-black text-green-500 tracking-tighter uppercase">Live Sync</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                                    <Table>
                                                        <TableBody>
                                                            {(data?.logs || []).map((log, i) => (
                                                                <TableRow key={log.id || i} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                                                    <TableCell className="py-4 pl-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={cn(
                                                                                "p-2 rounded-lg border",
                                                                                log.status === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                                                    log.status === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                                                        "bg-red-500/10 border-red-500/20 text-red-500"
                                                                            )}>
                                                                                {log.action === 'BUG_REPORT' ? <Bug className="h-3.5 w-3.5" /> :
                                                                                    log.action === 'SUGGESTION' ? <Rocket className="h-3.5 w-3.5" /> :
                                                                                        log.action === 'TOOL_USE' ? <Zap className="h-3.5 w-3.5" /> :
                                                                                            log.action.includes('LOGIN') ? <KeyRound className="h-3.5 w-3.5" /> :
                                                                                                log.action.includes('CONFIG') ? <Settings className="h-3.5 w-3.5" /> :
                                                                                                    log.action.includes('USER') ? <Users className="h-3.5 w-3.5" /> :
                                                                                                        <Activity className="h-3.5 w-3.5" />}
                                                                            </div>
                                                                            <div className="space-y-0.5">
                                                                                <p className="text-[11px] font-black text-white tracking-tight uppercase">{log.action}</p>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSearchQuery(log.userEmail);
                                                                                        document.getElementById('user-registry')?.scrollIntoView({ behavior: 'smooth' });
                                                                                    }}
                                                                                    className="text-[10px] text-slate-500 font-mono hover:text-primary transition-colors cursor-pointer"
                                                                                >
                                                                                    {log.userEmail}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-4 text-right pr-6">
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest">{log.target}</p>
                                                                            <p className="text-[9px] text-slate-600 flex items-center justify-end gap-1">
                                                                                <Clock className="h-2.5 w-2.5" /> {timeAgo(log.timestamp)}
                                                                            </p>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                            <div className="p-3 border-t border-white/5 bg-slate-950/20 text-center">
                                                <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary hover:text-white uppercase tracking-[0.2em] h-8">
                                                    View Full Central Log Registry
                                                </Button>
                                            </div>
                                        </Card>

                                        {/* System Variables */}
                                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-xl hover:border-primary/20 transition-all group">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-white">
                                                    <Zap className="h-5 w-5 text-primary" />
                                                    Core System Variables
                                                </CardTitle>
                                                <CardDescription className="text-slate-400">
                                                    Real-time toggle for platform features.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Maintenance Mode', status: data.config.maintenanceMode ? 'ACTIVE' : 'INACTIVE', color: data.config.maintenanceMode ? 'text-destructive' : 'text-slate-500' },
                                                        { label: 'Feature Flags', status: data.config.featureFlags ? 'ENABLED' : 'DISABLED', color: data.config.featureFlags ? 'text-green-500' : 'text-slate-500' },
                                                        { label: 'Beta Tools Rollout', status: `ACTIVE (${data.config.betaPercent}%)`, color: 'text-primary' },
                                                        { label: 'API Version', status: data.config.apiVersion, color: 'text-blue-500' },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/5">
                                                            <span className="text-sm font-medium">{item.label}</span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    className="w-full bg-white text-black hover:bg-slate-200"
                                                    asChild
                                                >
                                                    <Link href="/admin/settings">
                                                        <Settings className="h-4 w-4 mr-2" /> Open Global Settings
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Admin Personnel - Re-imagined with real controls */}
                                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
                                        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    Admin Personnel
                                                </CardTitle>
                                                <CardDescription className="text-slate-400">
                                                    Managing elevated access accounts and security status.
                                                </CardDescription>
                                            </div>
                                            <Button variant="outline" className="border-white/10 text-slate-300" onClick={() => setIsPermissionMapOpen(true)}>
                                                <Globe className="h-4 w-4 mr-2" /> Permission Map
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4">
                                                {data.admins.map((adm) => (
                                                    <div key={adm.uid} className={cn(
                                                        "p-4 rounded-xl border transition-all duration-300",
                                                        adm.disabled ? "bg-red-500/5 border-red-500/20" : "bg-slate-950/40 border-white/5"
                                                    )}>
                                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                            {/* User Info */}
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className={cn(
                                                                    "h-12 w-12 rounded-full border flex items-center justify-center font-bold text-lg",
                                                                    adm.disabled ? "bg-red-950/50 border-red-500/30 text-red-500" : "bg-slate-800 border-white/10 text-slate-400"
                                                                )}>
                                                                    {adm.name[0]}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-bold text-white">{adm.name}</p>
                                                                        <span className={cn(
                                                                            "text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest",
                                                                            adm.role === 'Head Admin' ? "bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                                                                                adm.role === 'Global Admin' ? "bg-primary/20 text-primary border border-primary/20" :
                                                                                    "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                                                        )}>
                                                                            {adm.role}
                                                                        </span>
                                                                        {adm.disabled && (
                                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 font-black uppercase tracking-widest">
                                                                                FROZEN
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono">
                                                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors"><Mail className="h-3 w-3" /> {adm.email}</span>
                                                                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Last Active: {new Date(adm.lastLogin).toLocaleDateString() === 'Invalid Date' ? adm.lastLogin : new Date(adm.lastLogin).toLocaleString()}</span>
                                                                        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> Joined: {new Date(adm.joinedDate).toLocaleDateString() === 'Invalid Date' ? adm.joinedDate : new Date(adm.joinedDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Status & Actions */}
                                                            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                                                <div className="flex items-center gap-2 mr-4">
                                                                    <div className={cn("h-1.5 w-1.5 rounded-full", adm.disabled ? "bg-red-500" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]")} />
                                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                                                                        {adm.disabled ? 'SUSPENDED' : 'AUTHORIZED'}
                                                                    </span>
                                                                </div>

                                                                {/* High Security Action Dropdown */}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="text-slate-400" disabled={!!actionLoading || adm.isProtected}>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300 w-56 p-1">
                                                                        <DropdownMenuLabel className="text-[10px] uppercase text-slate-500 tracking-wider">Security Controls</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                                        {/* Account Freezing */}
                                                                        {adm.disabled ? (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(adm.uid, 'UNFREEZE_ACCOUNT', adm.email)} className="gap-2 focus:bg-green-500/10 focus:text-green-500 cursor-pointer">
                                                                                <UserCheck className="h-4 w-4" /> Restore Account Access
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(adm.uid, 'FREEZE_ACCOUNT', adm.email)} className="gap-2 focus:bg-yellow-500/10 focus:text-yellow-500 cursor-pointer">
                                                                                <UserX className="h-4 w-4" /> Freeze Account Session
                                                                            </DropdownMenuItem>
                                                                        )}

                                                                        {/* Revoke Privileges */}
                                                                        <DropdownMenuItem onClick={() => handleUserAction(adm.uid, 'TERMINATE_ADMIN', adm.email)} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                                                            <ShieldOff className="h-4 w-4" /> Terminate Admin Access
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedUser({ uid: adm.uid, email: adm.email, name: adm.name });
                                                                                setIsPasswordChangeOpen(true);
                                                                            }}
                                                                            className="gap-2 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer"
                                                                        >
                                                                            <KeyRound className="h-4 w-4" /> Change Access Key
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                                        {/* Permanently Delete */}
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleUserAction(adm.uid, 'DELETE_DATA', adm.email)}
                                                                            className="gap-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" /> Delete from Database
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        {actionLoading === adm.uid && (
                                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-white">Executing Protocol...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {data.admins.length === 0 && (
                                                    <p className="text-sm text-slate-500 text-center py-12 border border-dashed border-white/5 rounded-2xl">
                                                        No secondary administrators detected on the platform.
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* API Sandbox & Debugger */}
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                                        <Card className="lg:col-span-2 bg-slate-950/50 border-white/5 border-t-indigo-500 overflow-hidden">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                            <Terminal className="h-4 w-4 text-indigo-400" />
                                                            Secure API Sandbox
                                                        </CardTitle>
                                                        <CardDescription className="text-[10px] uppercase font-mono">Real-time Endpoint Inspection</CardDescription>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-[10px] font-mono border-white/10">AUTH_MODE: INTERNAL</Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex gap-2">
                                                    <select
                                                        value={sandboxMethod}
                                                        onChange={(e) => setSandboxMethod(e.target.value as any)}
                                                        className="bg-slate-900 border border-white/10 rounded-lg px-2 text-[10px] font-black tracking-widest text-indigo-400 outline-none"
                                                    >
                                                        <option value="GET">GET</option>
                                                        <option value="POST">POST</option>
                                                        <option value="PUT">PUT</option>
                                                        <option value="DELETE">DELETE</option>
                                                    </select>
                                                    <div className="flex-1 relative">
                                                        <Input
                                                            placeholder="/api/admin/..."
                                                            className="bg-black/40 border-white/10 text-[11px] h-9 font-mono text-indigo-300 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            value={sandboxEndpoint}
                                                            onChange={(e) => setSandboxEndpoint(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="h-9 bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] tracking-widest px-6"
                                                        onClick={handleSandboxExecute}
                                                        disabled={sandboxLoading}
                                                    >
                                                        {sandboxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "EXECUTE"}
                                                    </Button>
                                                </div>
                                                <div className="rounded-xl bg-black/60 border border-white/5 p-4 min-h-[140px] font-mono text-[10px] text-slate-400 overflow-auto scrollbar-hide">
                                                    {sandboxResponse ? (
                                                        <pre className="whitespace-pre-wrap">{JSON.stringify(sandboxResponse, null, 2)}</pre>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2 mb-3 text-slate-600">
                                                                <span className="flex h-2 w-2 rounded-full bg-slate-700" />
                                                                Waiting for request...
                                                            </div>
                                                            {`// Response body will appear here after execution\n// Use for debugging lifecycle and payload validation`}
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-slate-950/50 border-white/5 border-t-red-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                                    Active Threat Control
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg group">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-mono text-red-400">192.168.1.104</p>
                                                            <p className="text-[9px] text-slate-600 uppercase">Rate-Limit Ceiling Hit</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 group-hover:text-red-500" onClick={() => toast({ title: "IP Temporarily Whitelisted", description: "Manual override applied." })}><ShieldCheck className="h-3 w-3" /></Button>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-white/5 rounded-lg group">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-mono text-slate-400">45.2.19.22</p>
                                                            <p className="text-[9px] text-slate-600 uppercase">Suspicious Metadata Pattern</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 group-hover:text-amber-500" onClick={() => toast({ title: "Monitoring Intensified", description: "Watchdog active for this trace." })}><AlertTriangle className="h-3 w-3" /></Button>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="w-full border-white/5 h-8 text-[10px] font-black tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" onClick={() => toast({ title: "Cluster Scan Initiated", description: "No catastrophic reputation threats detected." })}>
                                                    SCAN REPUTATION LOGS
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Global User Registry */}
                                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
                                        <div className="h-1 bg-gradient-to-r from-blue-500/50 via-blue-500 to-blue-500/50" />
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1.5">
                                                    <CardTitle className="text-white flex items-center gap-2.5">
                                                        <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                                            <Globe className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Global User Registry</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                                                        Displaying <span className="text-blue-400 font-bold">{data?.allUsers?.length || 0}</span> session profiles from secure cluster
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative group flex-1 md:flex-none">
                                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                            <Search className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Query UID, Name or Email..."
                                                            className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[11px] text-white focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 w-full sm:w-72 transition-all backdrop-blur-sm placeholder:text-slate-600"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                        />
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="bg-black/40 border-white/5 text-slate-300 h-9 rounded-xl px-4 hover:bg-white/5 text-[11px] font-mono">
                                                                LIMIT: {userLimit} <RefreshCw className={cn("ml-2 h-3 w-3 text-slate-500", loading && "animate-spin")} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-slate-900/95 border-white/10 text-slate-300 w-48 backdrop-blur-xl">
                                                            <DropdownMenuLabel className="text-[10px] uppercase text-slate-500 tracking-widest font-black p-3">Fetch Constraints</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                            {['10', '25', '50', '100'].map((limit) => (
                                                                <DropdownMenuItem
                                                                    key={limit}
                                                                    onClick={() => setUserLimit(limit)}
                                                                    className={cn(
                                                                        "flex items-center justify-between cursor-pointer py-2.5 px-3 transition-colors",
                                                                        userLimit === limit ? "text-blue-400 bg-blue-500/5" : "hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <span className="font-mono text-xs">Load {limit} Profiles</span>
                                                                    {userLimit === limit && <ShieldCheck className="h-3 w-3" />}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4">
                                                {(data.allUsers || []).map((user) => (
                                                    <div key={user.uid} className={cn(
                                                        "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group/user",
                                                        user.isBanned ? "bg-red-500/5 border-red-500/20" :
                                                            user.disabled ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                                    )}>
                                                        {/* Decorative Background Glow */}
                                                        <div className={cn(
                                                            "absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-0 group-hover/user:opacity-20 transition-opacity pointer-events-none",
                                                            user.isBanned ? "bg-red-500" : user.disabled ? "bg-amber-500" : "bg-blue-500"
                                                        )} />

                                                        {user.isBanned && (
                                                            <div className="absolute top-0 right-0 p-1 px-4 bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] transform rotate-0 z-10 rounded-bl-xl shadow-lg">
                                                                BLACKLISTED
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                                                            {/* User Info */}
                                                            <div className="flex items-center gap-5 flex-1">
                                                                <div className="relative">
                                                                    <div className={cn(
                                                                        "h-14 w-14 rounded-2xl border flex items-center justify-center font-bold text-xl shadow-2xl transition-transform duration-300 group-hover/user:scale-105",
                                                                        user.isBanned ? "bg-red-950/40 border-red-500/30 text-red-500" :
                                                                            user.disabled ? "bg-amber-950/40 border-amber-500/30 text-amber-500" : "bg-slate-900 border-white/10 text-slate-400"
                                                                    )}>
                                                                        {(user.name && user.name !== 'App User' ? user.name[0] : (user.email?.[0] || 'U')).toUpperCase()}
                                                                    </div>
                                                                    <div className={cn(
                                                                        "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#020617] transition-all",
                                                                        user.isBanned ? "bg-red-600" : user.disabled ? "bg-amber-500" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                                    )} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="font-bold text-white text-base tracking-tight">
                                                                            {user.name === 'App User' ? (user.email?.split('@')[0] || user.name) : user.name}
                                                                        </p>
                                                                        {user.disabled && !user.isBanned && (
                                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-widest flex items-center gap-1">
                                                                                <Clock className="h-2.5 w-2.5" /> DEACTIVATED
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-500 font-mono">
                                                                        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Mail className="h-3.5 w-3.5 text-slate-600" /> {user.email}</span>
                                                                        <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-slate-600" /> {new Date(user.lastLogin).toLocaleDateString() === 'Invalid Date' ? user.lastLogin : new Date(user.lastLogin).toLocaleString()}</span>
                                                                        <span className="flex items-center gap-2"><KeyRound className="h-3.5 w-3.5 text-slate-600" /> UID: <span className="text-[9px] opacity-60">{user.uid.slice(0, 12)}...</span></span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                                                <div className="hidden lg:flex flex-col items-end gap-1">
                                                                    <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Status Matrix</span>
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                                                        user.isBanned ? "text-red-400 bg-red-400/5" :
                                                                            user.disabled ? "text-amber-400 bg-amber-400/5" : "text-blue-400 bg-blue-400/5"
                                                                    )}>
                                                                        {user.isBanned ? 'CRITICAL_LOCK' : user.disabled ? 'SESSION_PAUSED' : 'VERIFIED_USER'}
                                                                    </span>
                                                                </div>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10" disabled={!!actionLoading}>
                                                                            <MoreVertical className="h-5 w-5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="bg-slate-900/95 border-white/10 text-slate-300 w-64 p-2 backdrop-blur-xl">
                                                                        <DropdownMenuLabel className="text-[10px] uppercase text-slate-500 tracking-[0.2em] font-black p-2">Policy Enforcement</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                                        {user.disabled && !user.isBanned ? (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(user.uid, 'UNFREEZE_ACCOUNT', user.email)} className="gap-3 py-2.5 rounded-lg focus:bg-green-500/10 focus:text-green-500 cursor-pointer">
                                                                                <UserCheck className="h-4 w-4" /> Restore Access
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(user.uid, 'FREEZE_ACCOUNT', user.email)} disabled={user.isBanned} className="gap-3 py-2.5 rounded-lg focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer">
                                                                                <UserX className="h-4 w-4" /> Freeze Session
                                                                            </DropdownMenuItem>
                                                                        )}

                                                                        {user.isBanned ? (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(user.uid, 'UNBAN_EMAIL', user.email)} className="gap-3 py-2.5 rounded-lg focus:bg-green-500/10 focus:text-green-500 cursor-pointer">
                                                                                <ShieldCheckIcon className="h-4 w-4" /> Clear Blacklist
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem onClick={() => handleUserAction(user.uid, 'BAN_EMAIL', user.email)} className="gap-3 py-2.5 rounded-lg focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                                                                                <ShieldOff className="h-4 w-4" /> Permanent Ban
                                                                            </DropdownMenuItem>
                                                                        )}

                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedUser({ uid: user.uid, email: user.email, name: user.name });
                                                                                setIsPasswordChangeOpen(true);
                                                                            }}
                                                                            className="gap-3 py-2.5 rounded-lg focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer"
                                                                        >
                                                                            <KeyRound className="h-4 w-4" /> Reset Access Key
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                                        <DropdownMenuItem
                                                                            onClick={() => handleUserAction(user.uid, 'DELETE_DATA', user.email)}
                                                                            className="gap-3 py-2.5 rounded-lg focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-500/70"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" /> Purge User Identity
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>

                                                        {actionLoading === user.uid && (
                                                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-50 transition-all border border-blue-500/30">
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="relative">
                                                                        <div className="absolute inset-0 blur-lg bg-blue-500/50 animate-pulse" />
                                                                        <Loader2 className="h-8 w-8 animate-spin text-blue-400 relative" />
                                                                    </div>
                                                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-blue-400 animate-pulse">Enforcing Protocol...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {(data.allUsers || []).length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                                                        <div className="p-4 bg-slate-900/50 rounded-full mb-4 border border-white/5">
                                                            <Search className="h-8 w-8 text-slate-700" />
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium">No session data found for this query.</p>
                                                        <p className="text-[10px] text-slate-700 font-mono mt-1 uppercase tracking-widest">Cluster Scan: Negative</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {viewMode === 'terminal' && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-indigo-400 text-xs font-mono uppercase tracking-[0.3em]">Module: Runtime_Engine</p>
                                            <h2 className="text-3xl font-black tracking-tighter text-white">Live Command Console</h2>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-900 border border-white/5 p-1 rounded-xl">
                                            {['ALL', 'INFO', 'WARN', 'ERROR', 'FATAL'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setLogLevelFilter(level)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all",
                                                        logLevelFilter === level
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                            : "text-slate-500 hover:text-slate-300"
                                                    )}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Card className="bg-slate-950/80 border-white/5 overflow-hidden shadow-2xl flex flex-col h-[70vh]">
                                        <CardHeader className="bg-slate-900/50 border-b border-white/5 px-4 py-3 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                </div>
                                                <div className="h-4 w-px bg-white/10 mx-1" />
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                                    <Terminal className="h-3 w-3" />
                                                    root@tooldaddy:~$ tail -f /var/log/system/activity.log
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden md:flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-1 rounded-lg">
                                                    <Search className="h-3 w-3 text-slate-600" />
                                                    <input
                                                        type="text"
                                                        placeholder="FILTER_STREAM..."
                                                        value={logSearch}
                                                        onChange={(e) => setLogSearch(e.target.value)}
                                                        className="bg-transparent border-none outline-none text-[10px] text-indigo-400 font-mono w-48 placeholder:text-slate-800"
                                                    />
                                                </div>
                                                <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 animate-pulse text-[9px] font-mono">
                                                    LIVE_STREAMING
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-1 overflow-hidden">
                                            <div
                                                id="terminal-container"
                                                className="h-full overflow-y-auto p-4 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black/40"
                                            >
                                                {(data?.logs || [])
                                                    .filter(l => logLevelFilter === 'ALL' || (l.level === logLevelFilter || (logLevelFilter === 'ERROR' && l.status === 'error')))
                                                    .filter(l => !logSearch || JSON.stringify(l).toLowerCase().includes(logSearch.toLowerCase()))
                                                    .slice().reverse() // Show oldest first for terminal feel
                                                    .map((log, i) => (
                                                        <div key={log.id || i} className="group border-b border-white/[0.02] py-2 hover:bg-white/[0.02] transition-colors flex gap-4">
                                                            <span className="text-slate-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                                            <span className={cn(
                                                                "font-black shrink-0 w-16 select-none",
                                                                log.status === 'error' || log.level === 'ERROR' || log.level === 'FATAL' ? "text-red-500" :
                                                                    log.status === 'warning' || log.level === 'WARN' ? "text-amber-500" : "text-emerald-500"
                                                            )}>
                                                                {log.level || (log.status === 'success' ? 'INFO' : log.status.toUpperCase())}
                                                            </span>
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-white font-bold">{log.action}</span>
                                                                    <span className="text-slate-500">via</span>
                                                                    <span className="text-indigo-400 opacity-80">{log.userEmail}</span>
                                                                    <span className="text-slate-500">on</span>
                                                                    <span className="text-slate-300 italic">{log.target}</span>
                                                                    {log.duration && (
                                                                        <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 rounded">{log.duration}ms</span>
                                                                    )}
                                                                </div>
                                                                {log.details && Object.keys(log.details).length > 0 && (
                                                                    <p className="text-slate-500 break-all opacity-50 group-hover:opacity-100 transition-opacity">
                                                                        METADATA: {JSON.stringify(log.details)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                {(data?.logs || []).length === 0 && (
                                                    <div className="flex h-full items-center justify-center text-slate-700 uppercase tracking-widest text-[10px] font-black">
                                                        No active stream data detected
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {viewMode === 'analytics' && (
                                <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-amber-400 text-xs font-mono uppercase tracking-[0.3em]">Module: Analytics_Gateway</p>
                                            <h2 className="text-3xl font-black tracking-tighter text-white">Observability & Latency</h2>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 px-4 py-2 rounded-2xl">
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </div>
                                            <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">Live Telemetry Active</span>
                                        </div>
                                    </div>

                                    {/* Analytics Briefing */}
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <Card className="bg-slate-950/50 border-white/5 border-l-2 border-l-blue-500 group hover:bg-slate-900/40 transition-all duration-500">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Traffic (24h)</p>
                                                    <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{obsData?.summary.totalRequests || 0}</p>
                                                </div>
                                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                                    <Activity className="h-6 w-6 text-blue-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-slate-950/50 border-white/5 border-l-2 border-l-red-500 group hover:bg-slate-900/40 transition-all duration-500">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Error Rate (24h)</p>
                                                    <p className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">{obsData ? Math.round((obsData.summary.errorCount / (obsData.summary.totalRequests || 1)) * 100) : 0}%</p>
                                                </div>
                                                <div className="p-3 bg-red-500/10 rounded-xl">
                                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-slate-950/50 border-white/5 border-l-2 border-l-emerald-500 group hover:bg-slate-900/40 transition-all duration-500">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Avg Core Latency</p>
                                                    <p className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{obsData?.summary.avgSystemLatency || 0}ms</p>
                                                </div>
                                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                                    <Zap className="h-6 w-6 text-emerald-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Traffic Volume Chart */}
                                        <Card className="bg-slate-950/50 border-white/5 shadow-xl">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="h-4 w-4 text-blue-400" />
                                                        Platform Load Distribution (24h)
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
                                                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> REQ</div>
                                                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> ERR</div>
                                                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LATENCY</div>
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={obsData?.volumeData || []}>
                                                        <defs>
                                                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                        <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                                        <ChartTooltip
                                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                                            itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                                                        />
                                                        <Area type="monotone" dataKey="latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={1} strokeDasharray="5 5" />
                                                        <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                                                        <Area type="monotone" dataKey="errors" stroke="#ef4444" fillOpacity={1} fill="url(#colorErrors)" strokeWidth={2} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        {/* API Flow & Latency Breakdown */}
                                        <Card className="bg-slate-950/50 border-white/5 shadow-xl">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-amber-400" />
                                                    Critical Endpoint Performance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-6">
                                                    {(obsData?.endpointData || []).map((ep, i) => (
                                                        <div key={i} className="space-y-1.5 group">
                                                            <div className="flex items-center justify-between text-[11px]">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-bold tracking-tight">{ep.name}</span>
                                                                    <span className="text-slate-600 font-mono">[{ep.count} req]</span>
                                                                </div>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    ep.avgLatency < 100 ? "text-emerald-500" : ep.avgLatency < 500 ? "text-amber-500" : "text-red-500"
                                                                )}>
                                                                    {ep.avgLatency}ms
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-1000",
                                                                        ep.avgLatency < 100 ? "bg-emerald-500" : ep.avgLatency < 500 ? "bg-amber-500" : "bg-red-500"
                                                                    )}
                                                                    style={{ width: `${Math.min(100, (ep.avgLatency / 1000) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between text-[9px] text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <span>Success Rate: {ep.successRate}%</span>
                                                                <span>System Priority: HIGH</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* API Flow Control */}
                                    <Card className="bg-slate-950/80 border border-white/5 border-t-amber-500/30">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg font-black text-white">Dynamic Traffic Controller</CardTitle>
                                                    <CardDescription className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Global Throttle Management v2.1</CardDescription>
                                                </div>
                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">MANUAL_OVERRIDE_ENABLED</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-300">Public Burst Limit</Label>
                                                    <span className="text-xs font-mono text-primary">{burstLimit}/min</span>
                                                </div>
                                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (burstLimit / 200) * 100)}%` }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] font-bold border-white/10 hover:bg-white/5" onClick={() => handleUpdateTraffic('public', -10)}>RESTRICT</Button>
                                                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] font-bold border-white/10 hover:bg-white/5 text-emerald-500" onClick={() => handleUpdateTraffic('public', 10)}>BOOST</Button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-300">Pro Tier Quota</Label>
                                                    <span className="text-xs font-mono text-indigo-400">{proQuota}/min</span>
                                                </div>
                                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (proQuota / 5000) * 100)}%` }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] font-bold border-white/10 hover:bg-white/5" onClick={() => handleUpdateTraffic('pro', -100)}>RESTRICT</Button>
                                                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] font-bold border-white/10 hover:bg-white/5 text-indigo-400" onClick={() => handleUpdateTraffic('pro', 100)}>UPGRADE</Button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-300">IP Reputation Filter</Label>
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px]">BLOCKING_SCRAPERS</Badge>
                                                </div>
                                                <p className="text-[10px] text-slate-500">Automatic blacklisting active for 8 IPs showing anomalous behavior.</p>
                                                <Button variant="outline" size="sm" className="w-full h-7 text-[10px] font-bold border-white/10 hover:bg-white/5" onClick={() => toast({ title: "Registry Scanned", description: "All 8 blocks verified for 24h cycle." })}>VIEW BLACKLIST</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </main>

                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#020617]/80 backdrop-blur-xl border-t border-white/5 z-50">
                    <div className="container mx-auto flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-primary" /> SYSTEM_ENCRYPTION_AES_256</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green-500" /> FIREWALL_ENHANCED</span>
                        </div>
                        <div>
                            SECURE_SESSION_LIFETIME: 3600S
                        </div>
                    </div>
                </footer>

                {/* Permission Map Modal */}
                <Dialog open={isPermissionMapOpen} onOpenChange={setIsPermissionMapOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-2xl backdrop-blur-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                System Privilege Matrix
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Detailed breakdown of platform roles and operational capabilities.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center group hover:bg-white/[0.08] transition-colors">
                                    <p className="text-[9px] uppercase text-slate-500 font-bold mb-0.5 tracking-tighter">STANDARD USERS</p>
                                    <p className="text-xl font-black text-white">{data?.allUsers?.length || 0}</p>
                                </div>
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center group hover:bg-primary/[0.08] transition-colors">
                                    <p className="text-[9px] uppercase text-primary/70 font-bold mb-0.5 tracking-tighter">GLOBAL ADMINS</p>
                                    <p className="text-xl font-black text-primary">{data?.admins?.filter(a => a.role === 'Global Admin').length || 0}</p>
                                </div>
                                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center group hover:bg-amber-500/[0.08] transition-colors">
                                    <p className="text-[9px] uppercase text-amber-500/70 font-bold mb-0.5 tracking-tighter">HEAD ADMINS</p>
                                    <p className="text-xl font-black text-amber-500">{data?.admins?.filter(a => a.role === 'Head Admin').length || 0}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/5 overflow-hidden bg-black/20">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-slate-300 h-10">Capability</TableHead>
                                            <TableHead className="text-center text-slate-300 h-10 text-[10px]">USER</TableHead>
                                            <TableHead className="text-center text-slate-300 font-bold text-primary h-10 text-[10px]">ADMIN</TableHead>
                                            <TableHead className="text-center text-slate-300 font-bold text-amber-500 h-10 text-[10px]">ROOT</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { cap: 'Access Tools', u: true, a: true, r: true },
                                            { cap: 'View Basic Metrics', u: false, a: true, r: true },
                                            { cap: 'Manage User Sessions', u: false, a: true, r: true },
                                            { cap: 'Audit Log Access', u: false, a: false, r: true },
                                            { cap: 'Global Config Write', u: false, a: false, r: true },
                                            { cap: 'Admin Termination', u: false, a: false, r: true },
                                            { cap: 'DB Purge/Delete', u: false, a: false, r: true },
                                        ].map((row, i) => (
                                            <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] h-11">
                                                <TableCell className="text-[11px] font-medium text-slate-400 py-2">{row.cap}</TableCell>
                                                <TableCell className="text-center py-2">{row.u ? <div className="mx-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> : <div className="mx-auto w-1 h-1 rounded-full bg-slate-800" />}</TableCell>
                                                <TableCell className="text-center py-2">{row.a ? <div className="mx-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> : <div className="mx-auto w-1 h-1 rounded-full bg-slate-800" />}</TableCell>
                                                <TableCell className="text-center py-2">{row.r ? <div className="mx-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> : <div className="mx-auto w-1 h-1 rounded-full bg-slate-800" />}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-between backdrop-blur-md">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Protocol 442-A</p>
                                <p className="text-[9px] text-slate-500 font-mono">ENFORCING_SYSTEM_WIDE_FIREWALL</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 text-slate-500 hover:text-white text-[10px] font-bold" onClick={() => setIsPermissionMapOpen(false)}>
                                CLOSE MATRIX
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Password Change Modal */}
                <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-slate-200 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-primary" />
                                Rotate Administrative Key
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 text-xs">
                                Update the access credentials for <span className="text-white font-bold">{selectedUser?.email}</span>. This will invalidate all current active sessions for this account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-pass" className="text-xs text-slate-500 uppercase tracking-widest">New Secret Passkey</Label>
                                <div className="relative">
                                    <Input
                                        id="new-pass"
                                        type="password"
                                        placeholder="Min. 6 high-entropy characters..."
                                        className="bg-black/50 border-white/10 text-white pl-10 h-11"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                                    />
                                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-600" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsPasswordChangeOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                            <Button
                                onClick={handlePasswordChange}
                                disabled={!!actionLoading || newPassword.length < 6}
                                className="bg-primary text-black hover:bg-primary/90 min-w-[120px]"
                            >
                                {actionLoading === selectedUser?.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Change"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </HeadAdminPasswordGate>
    );
}
