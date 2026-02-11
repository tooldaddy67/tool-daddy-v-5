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
    const q = query(
        collection(db, COLLECTION),
        where('published', '==', true)
        // orderBy('createdAt', 'desc') // Removed to avoid composite index requirement
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Timestamp to Date or ISO string if needed for hydration serialization
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        } as BlogPost;
    });

    // Sort in memory
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
        where('published', '==', true),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    } as BlogPost;
}
