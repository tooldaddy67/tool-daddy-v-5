export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    tags: string[];
    author: {
        uid: string;
        displayName: string;
        photoURL?: string;
    };
    published: boolean;
    status?: 'draft' | 'published' | 'scheduled';
    scheduledAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
    // Database disabled (System rebuild in progress)
    return [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    // Database disabled (System rebuild in progress)
    return null;
}
