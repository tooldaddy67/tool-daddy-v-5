'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdmin();
    const router = useRouter();
    const pathname = usePathname();

    // useEffect(() => {
    //     if (!loading && !isAdmin) {
    //         router.push('/');
    //     }
    // }, [isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium">Verifying access...</span>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
                    <p className="text-muted-foreground max-w-[400px]">
                        This area is protected. You either don't have permission or your session needs a refresh.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Return Home
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Retry Verification
                    </Button>
                </div>
                <div className="mt-8 p-4 bg-muted/50 rounded-lg text-xs font-mono text-left w-full max-w-md overflow-auto border border-border/50">
                    <p className="font-bold mb-2 opacity-50 uppercase tracking-widest">Debug Diagnostic</p>
                    <div className="grid grid-cols-[100px_1fr] gap-1">
                        <span className="opacity-70">Status:</span>
                        <span className="text-destructive font-bold">Denied</span>
                        <span className="opacity-70">Loading:</span>
                        <span>{String(loading)}</span>
                        <span className="opacity-70">Is Admin:</span>
                        <span>{String(isAdmin)}</span>
                        <span className="opacity-70">Current Path:</span>
                        <span>{pathname}</span>
                    </div>
                </div>
            </div>
        );
    }



    const navItems = [
        { name: 'Overview', href: '/admin/dashboard' },
        { name: 'Feedback', href: '/admin/feedback' },
        { name: 'Tools Usage', href: '/admin/tools' },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Admin Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-primary">Admin Panel</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Master Control</p>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                    pathname === item.href
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
