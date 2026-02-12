import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    limit
} from 'firebase/firestore';
import { getFirestoreServer } from '@/firebase/server';

const COLLECTION = 'posts';

// Use the Server App instance
const db = getFirestoreServer();

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
    createdAt: any; // Timestamp
    updatedAt: any; // Timestamp
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
    const now = new Date();
    // Fetch posts that are either published or scheduled
    const q = query(
        collection(db, COLLECTION),
        where('status', 'in', ['published', 'scheduled'])
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        const scheduledAtDate = data.scheduledAt?.toDate?.() || null;

        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            scheduledAtDate,
        } as any;
    }).filter(post => {
        if (post.status === 'published' || post.published === true) return true;
        if (post.status === 'scheduled' && post.scheduledAtDate && post.scheduledAtDate <= now) return true;
        return false;
    });

    return posts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(
        collection(db, COLLECTION),
        where('slug', '==', slug),
        where('status', 'in', ['published', 'scheduled']),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    const now = new Date();

    // Verification for scheduled posts
    if (data.status === 'scheduled') {
        const scheduledDate = data.scheduledAt?.toDate?.() || null;
        if (!scheduledDate || scheduledDate > now) {
            return null; // Don't show scheduled posts early
        }
    }

    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    } as BlogPost;
}
