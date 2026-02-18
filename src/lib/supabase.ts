import { createBrowserClient, createServerClient } from '@supabase/ssr';

// Client-side supabase instance
export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('[Supabase] Missing environment variables in browser:', { hasUrl: !!url, hasKey: !!key });
        throw new Error('Missing Supabase configuration');
    }

    return createBrowserClient(url, key);
};

// Server-side supabase instance (for API routes/Server Actions)
export const createServer = (cookieStore: any) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};
