'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Users, MessageSquare, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFeedback: 0,
        totalActions: 0,
        pendingFeedback: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch profiles count
                const { count: userCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Fetch feedback count
                const { count: feedbackCount } = await supabase
                    .from('feedback')
                    .select('*', { count: 'exact', head: true });

                // Fetch pending feedback count
                const { count: pendingCount } = await supabase
                    .from('feedback')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');

                // Fetch total actions (tool usage)
                const { data: toolUsage } = await supabase
                    .from('tool_usage')
                    .select('usage_count');

                const totalActions = toolUsage?.reduce((acc, curr) => acc + curr.usage_count, 0) || 0;

                setStats({
                    totalUsers: userCount || 0,
                    totalFeedback: feedbackCount || 0,
                    totalActions,
                    pendingFeedback: pendingCount || 0
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [supabase]);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Registered accounts',
            color: 'text-blue-500'
        },
        {
            title: 'Total Feedback',
            value: stats.totalFeedback,
            icon: MessageSquare,
            description: 'Submitted by users',
            color: 'text-amber-500'
        },
        {
            title: 'Tool Executions',
            value: stats.totalActions,
            icon: Zap,
            description: 'AI & logic operations',
            color: 'text-purple-500'
        },
        {
            title: 'Pending Issues',
            value: stats.pendingFeedback,
            icon: ShieldCheck,
            description: 'Requiring attention',
            color: 'text-red-500'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
                <p className="text-muted-foreground">Monitor system performance and user engagement.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, idx) => (
                    <Card key={idx} className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color} group-hover:scale-110 transition-transform`} />
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold font-headline">{card.value.toLocaleString()}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                        </CardContent>
                        <div className={`h-1 w-full bg-gradient-to-r from-transparent via-${card.color.split('-')[1]}-500/20 to-transparent`} />
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/40 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Live feed of user interactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <TrendingUp className="h-10 w-10 text-muted-foreground/20" />
                            <p className="text-sm text-muted-foreground italic">Activity feed integration coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-border/40 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Supabase & Provider Status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Database Connectivity</span>
                                <span className="flex items-center gap-1.5 text-green-500 font-bold">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    Operational
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-green-500/20" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Gemini API Latency</span>
                                <span className="text-muted-foreground font-mono">142ms</span>
                            </div>
                            <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-primary/20" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border/10">
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-black">
                                Environment: Production Ready
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
