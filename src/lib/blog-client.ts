export interface BlogPostInput {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    focusKeyword?: string;
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
    // Database disabled (System rebuild in progress)
    return [];
}

export async function getPostById(id: string) {
    // Database disabled (System rebuild in progress)
    return null;
}

export async function createPost(post: BlogPostInput) {
    // Database disabled (System rebuild in progress)
    return { id: 'disabled' };
}

export async function updatePost(id: string, post: Partial<BlogPostInput>) {
    // Database disabled (System rebuild in progress)
    return;
}

export async function deletePost(id: string) {
    // Database disabled (System rebuild in progress)
    return;
}

export async function uploadImage(file: File, path: string) {
    // Storage might still be used, but keeping it simple for now
    return "";
}
