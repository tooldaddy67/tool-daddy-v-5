'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdmin();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
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
