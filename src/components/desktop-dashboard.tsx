"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/components/settings-provider';
import { collection, query, orderBy, limit, doc, Timestamp, where } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Layout,
    CheckCircle2,
    Plus,
    MoreHorizontal,
    ArrowRight,
    Zap,
    Grid,
    ListTodo,
    Loader2,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { DesktopCalendar } from '@/components/desktop-calendar';

export function DesktopDashboard() {
    const { user, firestore, isUserLoading } = useFirebase();
    const router = useRouter();
    // Safely attempt to use settings, fallback if context is missing (though it shouldn't be)
    let settings: any = { dataPersistence: true };
    try {
        const settingsContext = useSettings();
        settings = settingsContext.settings;
    } catch (e) {
        // Fallback or ignore if used outside provider (unlikely in this app structure)
    }

    // --- State for Local Data (Guest Mode) ---
    const [localLists, setLocalLists] = useState<{ id: string, name: string, createdAt: any }[]>([]);
    const [localTasks, setLocalTasks] = useState<{ [listId: string]: { id: string, text: string, completed: boolean, dueDate?: any, createdAt: any }[] }>({});
    const [isLocalLoaded, setIsLocalLoaded] = useState(false);

    // --- Constants from todo-list.tsx ---
    const TODO_LISTS_STORAGE_KEY = 'tool-daddy-todo-lists';
    const TASKS_STORAGE_KEY_PREFIX = 'tool-daddy-tasks-';

    // --- Load Local Data on Mount ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedLists = localStorage.getItem(TODO_LISTS_STORAGE_KEY);
                if (storedLists) {
                    const parsedLists = JSON.parse(storedLists);
                    setLocalLists(parsedLists);

                    const allTasks: any = {};
                    parsedLists.forEach((list: any) => {
                        const storedTasks = localStorage.getItem(`${TASKS_STORAGE_KEY_PREFIX}${list.id}`);
                        if (storedTasks) {
                            allTasks[list.id] = JSON.parse(storedTasks);
                        }
                    });
                    setLocalTasks(allTasks);
                }
            } catch (e) {
                console.error("Failed to load local todos", e);
            } finally {
                setIsLocalLoaded(true);
            }
        }
    }, []);

    // --- Format Date for Header ---
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

    // --- Fetch Cloud Data ---
    // 1. Fetch Lists
    const listsQuery = useMemoFirebase(() => {
        if (!user || user.isAnonymous || !firestore || !settings.dataPersistence) return null;
        return query(collection(firestore, 'users', user.uid, 'todolists'), orderBy('createdAt', 'desc'));
    }, [user, firestore, settings.dataPersistence]);

    const { data: cloudLists, isLoading: listsLoading } = useCollection<{ id: string, name: string }>(listsQuery);

    // --- Combine Data ---
    // Use Cloud if logged in + persistence enabled, otherwise Local
    const useCloud = user && !user.isAnonymous && settings.dataPersistence;

    // Lists
    const allLists = useMemo(() => {
        if (useCloud) return cloudLists || [];
        return localLists;
    }, [useCloud, cloudLists, localLists]);

    // Active List (Default to first)
    const activeList = allLists?.[0];
    const activeListId = activeList?.id;

    // Tasks
    // If Cloud: Fetch for active list
    const tasksQuery = useMemoFirebase(() => {
        if (!useCloud || !firestore || !activeListId) return null;
        return query(collection(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks'), orderBy('createdAt', 'desc'), limit(20));
    }, [useCloud, firestore, activeListId, user]);

    const { data: cloudTasks, isLoading: tasksLoading } = useCollection<{ id: string, text: string, completed: boolean, dueDate?: Timestamp }>(tasksQuery);

    // If Local: Get from state
    const displayTasks = useMemo(() => {
        if (useCloud) return cloudTasks || [];
        if (!activeListId) return [];

        // Transform local tasks to match shape if needed (dates are strings in JSON)
        const tasks = localTasks[activeListId] || [];
        return tasks.map(t => ({
            ...t,
            // Mock Timestamp-like object for local dates if they exist and aren't already objects
            dueDate: t.dueDate ? (t.dueDate.seconds ? t.dueDate : Timestamp.fromDate(new Date(t.dueDate))) : undefined
        })).sort((a, b) => {
            // Sort by createdAt desc locally to match query
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [useCloud, cloudTasks, localTasks, activeListId]);

    const isLoading = useCloud ? (listsLoading || tasksLoading) : !isLocalLoaded;

    // --- Interaction Handlers ---
    const handleToggleTask = (taskId: string, currentStatus: boolean) => {
        if (useCloud) {
            if (!firestore || !user || !activeListId) return;
            const taskRef = doc(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks', taskId);
            updateDocumentNonBlocking(taskRef, { completed: !currentStatus });
        } else {
            // Handle Local Toggle
            if (!activeListId) return;
            const currentListTasks = localTasks[activeListId] || [];
            const updatedTasks = currentListTasks.map(t =>
                t.id === taskId ? { ...t, completed: !currentStatus } : t
            );

            setLocalTasks(prev => ({
                ...prev,
                [activeListId]: updatedTasks
            }));

            localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}${activeListId}`, JSON.stringify(updatedTasks));
        }
    };

    // --- Derived Data ---
    const incompleteTasks = displayTasks?.filter(t => !t.completed) || [];
    const upcomingTasks = displayTasks?.filter(t => t.dueDate && t.dueDate.toDate() >= new Date()).sort((a, b) => a.dueDate!.toMillis() - b.dueDate!.toMillis()) || [];

    if (isUserLoading || (user && !user.isAnonymous && listsLoading)) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{formattedDate}</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                        Hello, {user?.displayName?.split(' ')[0] || 'Friend'}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light">How can I help you today?</p>
                </div>

                {/* Action Pills */}
                <div className="flex flex-wrap gap-3">
                    <Link href="/tools?category=AI Tools">
                        <Button variant="outline" className="rounded-full h-10 px-6 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-colors">
                            <Zap className="w-4 h-4 mr-2" /> Ask AI
                        </Button>
                    </Link>
                    <Link href="/todo-list">
                        <Button variant="outline" className="rounded-full h-10 px-6 border-border/50 bg-background/50 hover:bg-muted/50 transition-colors">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Manage Tasks
                        </Button>
                    </Link>
                    <Link href="/todo-list">
                        <Button variant="outline" className="rounded-full h-10 px-6 border-border/50 bg-background/50 hover:bg-muted/50 transition-colors">
                            <Layout className="w-4 h-4 mr-2" /> Create List
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Left Column (Wide) --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* My Tasks Widget */}
                    <Card className="tool-island h-full min-h-[500px] flex flex-col transition-all duration-500" style={{ borderRadius: 'var(--radius)' }}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ListTodo className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-lg font-bold">
                                    {activeList ? activeList.name : 'My Tasks'}
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href="/todo-list">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="w-4 h-4" /></Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            {activeList ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1 rounded-md">
                                            IN PROGRESS • {incompleteTasks.length} tasks
                                        </Badge>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {displayTasks && displayTasks.length > 0 ? (
                                            displayTasks.map(task => (
                                                <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50 cursor-pointer">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <Checkbox
                                                            checked={task.completed}
                                                            onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                                                            className="rounded-full w-5 h-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <span className={cn("font-medium text-sm truncate", task.completed && "line-through text-muted-foreground")}>
                                                            {task.text}
                                                        </span>
                                                    </div>
                                                    {task.dueDate && (
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="outline" className={cn(
                                                                "border-0 bg-opacity-10",
                                                                (task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate)) < new Date() && !task.completed ? "bg-red-500 text-red-500" : "bg-blue-500 text-blue-500"
                                                            )}>
                                                                {task.dueDate instanceof Timestamp ? format(task.dueDate.toDate(), 'MMM d') : format(new Date(task.dueDate), 'MMM d')}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <p>No tasks in this list.</p>
                                                <Link href="/todo-list">
                                                    <Button variant="link" className="mt-2">Add a task</Button>
                                                </Link>
                                            </div>
                                        )}

                                        <Link href="/todo-list">
                                            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary pl-2 h-10 mt-2">
                                                <Plus className="w-4 h-4 mr-2" /> Add task
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                    <p>You don't have any lists yet.</p>
                                    <Link href="/todo-list">
                                        <Button>Create a List</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- Right Column (Narrow) --- */}
                <div className="space-y-6">
                    {/* Projects Widget (Lists) */}
                    <Card className="tool-island transition-all duration-500" style={{ borderRadius: 'var(--radius)' }}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Layout className="w-5 h-5 text-blue-500" />
                                </div>
                                <CardTitle className="text-lg font-bold">Projects</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-8">All <ArrowRight className="w-3 h-3 ml-1" /></Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-3">
                            <Link href="/todo-list">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Create new project</p>
                                    </div>
                                </div>
                            </Link>

                            {allLists && allLists.slice(0, 3).map((list, i) => (
                                <Link href="/todo-list" key={list.id}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer mb-2">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-20",
                                            i === 0 ? "bg-pink-500 text-pink-500" :
                                                i === 1 ? "bg-indigo-500 text-indigo-500" : "bg-teal-500 text-teal-500"
                                        )}>
                                            <Grid className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{list.name}</p>
                                            <p className="text-[10px] text-muted-foreground">View details</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Calendar Widget (Upcoming Tasks) */}
                    <Card className="tool-island h-fit transition-all duration-500" style={{ borderRadius: 'var(--radius)' }}>
                        <CardContent className="p-4">
                            <DesktopCalendar tasks={displayTasks} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function MaximizeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
    )
}
