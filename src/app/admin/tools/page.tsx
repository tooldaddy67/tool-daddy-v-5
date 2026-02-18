'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, AlertCircle } from 'lucide-react';

export default function AdminToolsPage() {
    const [usage, setUsage] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const { data, error } = await supabase
                    .from('tool_usage')
                    .select('*')
                    .order('usage_count', { ascending: false })
                    .limit(50);

                if (error) throw error;
                setUsage(data || []);
            } catch (error) {
                console.error('Error fetching tool usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, [supabase]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tools Usage</h1>
                <p className="text-muted-foreground">Monitor which tools are most popular and track resource consumption.</p>
            </div>

            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Popularity Metrics
                    </CardTitle>
                    <CardDescription>Top tools by execution count.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : usage.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-muted-foreground/20" />
                            <p className="text-sm text-muted-foreground italic">No usage data recorded yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tool ID</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Execution Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usage.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                                        <TableCell className="font-mono text-xs">{item.tool_id}</TableCell>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                                            {item.user_id}
                                        </TableCell>
                                        <TableCell>{item.usage_date}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">{item.usage_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
