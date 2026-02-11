import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    getDoc,
    where
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize services assuming default app is initialized by Client Provider
function getDb() {
    return getFirestore(getApp());
}

function getStorageInstance() {
    return getStorage(getApp());
}

const COLLECTION = 'posts';

export interface BlogPostInput {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    tags: string[];
    published: boolean;
    status?: 'draft' | 'published' | 'scheduled';
    scheduledAt?: Date | null;
    author: {
        uid: string;
        displayName: string;
        photoURL?: string | null;
    };
}

export async function getAllPostsAdmin() {
    const q = query(collection(getDb(), COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getPostById(id: string) {
    const docRef = doc(getDb(), COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
}

export async function createPost(post: BlogPostInput) {
    return addDoc(collection(getDb(), COLLECTION), {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updatePost(id: string, post: Partial<BlogPostInput>) {
    const docRef = doc(getDb(), COLLECTION, id);
    return updateDoc(docRef, {
        ...post,
        updatedAt: serverTimestamp(),
    });
}

export async function deletePost(id: string) {
    return deleteDoc(doc(getDb(), COLLECTION, id));
}

export async function uploadImage(file: File, path: string) {
    const storageRef = ref(getStorageInstance(), path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}
