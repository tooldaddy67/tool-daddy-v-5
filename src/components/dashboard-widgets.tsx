"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { History, FileText, ListTodo, ArrowRight, Loader2, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, limit, doc } from 'firebase/firestore'
import { useHistory } from '@/hooks/use-history'
import { cn } from '@/lib/utils'
// @ts-ignore
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function DashboardWidgets() {
    const { user, isUserLoading } = useFirebase()

    return (
        <div className="min-h-[200px] w-full">
            {isUserLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-muted/30 border-dashed animate-pulse h-[200px]">
                            <CardContent className="h-full flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4">
                    <HistoryWidget />
                    <NotesWidget />
                    {!user.isAnonymous && <TasksWidget />}
                </div>
            ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm italic">
                    Log in to see your personalized dashboard activity.
                </div>
            )}
        </div>
    )
}

function HistoryWidget() {
    const { history } = useHistory()
    const recentHistory = history.slice(0, 3)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="h-full bg-secondary/30 border-white/5 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20"
                        >
                            <History className="h-4 w-4 text-purple-400" />
                        </div>
                        Recent Activity
                    </CardTitle>
                    <Link href="/history">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground glow-button" aria-label="View history">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4">No recent activity yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentHistory.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs group">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                                    <div className="flex-1 truncate">
                                        <p className="font-medium truncate">{item.tool}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

function NotesWidget() {
    const { user, firestore } = useFirebase()

    const noteDocRef = useMemoFirebase(() => {
        if (!user || user.isAnonymous || !firestore) return null
        return doc(firestore, 'users', user.uid, 'settings', 'notepad')
    }, [user, firestore])

    const { data: cloudNote, isLoading: isCloudLoading } = useDoc<{ content: string }>(noteDocRef)

    // Fallback to local storage for guests
    const [localNote, setLocalNote] = useState<string | null>(null)
    useEffect(() => {
        if (user?.isAnonymous) {
            const stored = localStorage.getItem('simple-notepad-content')
            setLocalNote(stored)
        }
    }, [user])

    const previewContent = useMemo(() => {
        const content = user?.isAnonymous ? localNote : cloudNote?.content
        if (!content) return "Your notepad is empty."
        // Strip basic HTML/Markdown-like markers for preview
        const stripped = content.replace(/<[^>]*>/g, '').substring(0, 150)
        return stripped + (content.length > 150 ? "..." : "")
    }, [user, cloudNote, localNote])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card className="h-full bg-secondary/30 border-white/5 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20"
                        >
                            <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        Latest Note
                    </CardTitle>
                    <Link href="/simple-notepad">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground glow-button" aria-label="Open notepad">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {isCloudLoading && !user?.isAnonymous ? (
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-muted rounded animate-pulse" />
                            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "{previewContent}"
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

function TasksWidget() {
    const { user, firestore } = useFirebase()

    // First get the active list ID (simulating simple access to first list for dashboard)
    const listsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null
        return query(collection(firestore, 'users', user.uid, 'todolists'), orderBy('createdAt', 'desc'), limit(1))
    }, [user, firestore])

    const { data: lists } = useCollection<{ id: string }>(listsQuery)
    const activeListId = lists?.[0]?.id

    const tasksQuery = useMemoFirebase(() => {
        if (!user || !firestore || !activeListId) return null
        // Simplify query to avoid requiring a composite index (orderBy completed + orderBy createdAt)
        return query(collection(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks'), orderBy('createdAt', 'desc'), limit(5))
    }, [user, firestore, activeListId])

    const { data: tasks, isLoading } = useCollection<{ text: string, completed: boolean }>(tasksQuery)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card className="h-full bg-secondary/30 border-white/5 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <ListTodo className="h-4 w-4 text-emerald-400" />
                        </div>
                        Top Tasks
                    </CardTitle>
                    <Link href="/todo-list">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground glow-button" aria-label="Go to task list">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-muted rounded animate-pulse" />
                            <div className="h-3 w-full bg-muted rounded animate-pulse" />
                        </div>
                    ) : !tasks || tasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4">No tasks found in your main list.</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    {task.completed ? (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                        <div className="h-3 w-3 rounded-full border border-emerald-500/30" />
                                    )}
                                    <span className={cn("truncate", task.completed && "line-through text-muted-foreground")}>
                                        {task.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
