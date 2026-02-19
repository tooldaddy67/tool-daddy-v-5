
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useAuth } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, User, Clock, Settings, LayoutDashboard, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
    const { user, isUserLoading } = useFirebase();
    const supabase = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [newName, setNewName] = useState('');
    const { toast } = useToast();

    // Protect the route
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    // History fetching disabled (System rebuild in progress)
    useEffect(() => {
        // We could load from local storage here if we wanted to match the new useHistory behavior
        const localData = localStorage.getItem('tool-daddy-history');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                setHistory(parsed.map((item: any) => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                })));
            } catch (e) {
                console.error("Failed to parse local history", e);
            }
        }
        setIsLoadingHistory(false);
    }, [user]);

    // Update Profile Name
    const handleUpdateName = async () => {
        if (!user || !newName.trim() || !supabase) return;
        try {
            await supabase.auth.updateUser({ data: { display_name: newName, full_name: newName } });
            toast({ title: 'Profile Updated', description: 'Your display name has been changed.' });
            setNewName('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-8 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/20 shadow-sm">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shrink-0 overflow-hidden">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                        (user.displayName?.[0] || user.email?.[0] || 'U')
                    )}
                </div>
                <div className="text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.displayName || 'Friend'}!</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Welcome to your dashboard</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
                    <TabsTrigger value="overview">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{history.length}</div>
                                <p className="text-xs text-muted-foreground">Recorded tool usages</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your last 5 actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.slice(0, 5).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.tool}</span>
                                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Name</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={user.displayName || "Enter your name"}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                    <Button onClick={handleUpdateName}>Save</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input disabled value={user.email || ''} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
