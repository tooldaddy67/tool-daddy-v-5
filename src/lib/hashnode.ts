import { GraphQLClient } from 'graphql-request';

const API_ENDPOINT = 'https://gql.hashnode.com';

export const hashnodeClient = new GraphQLClient(API_ENDPOINT, {
    headers: {
        // Only include Authorization if the token exists to avoid errors on public posts
        ...(process.env.HASHNODE_ACCESS_TOKEN && {
            Authorization: process.env.HASHNODE_ACCESS_TOKEN,
        }),
    },
});

export const GET_POSTS_QUERY = `
  query GetPosts($publicationId: ObjectId!, $first: Int!) {
    publication(id: $publicationId) {
      posts(first: $first) {
        edges {
          node {
            id
            title
            brief
            slug
            coverImage {
              url
            }
            publishedAt
          }
        }
      }
    }
  }
`;

export const GET_POST_QUERY = `
  query GetPost($publicationId: ObjectId!, $slug: String!) {
    publication(id: $publicationId) {
      post(slug: $slug) {
        id
        title
        subtitle
        brief
        slug
        coverImage {
          url
        }
        content {
          html
        }
        seo {
          title
          description
        }
        publishedAt
      }
    }
  }
`;

export interface Post {
    id: string;
    title: string;
    brief: string;
    slug: string;
    coverImage?: {
        url: string;
    };
    content?: {
        html: string;
    };
    seo?: {
        title?: string;
        description?: string;
    };
    publishedAt: string;
}

export async function getAllPosts(first = 10): Promise<Post[]> {
    const publicationId = process.env.HASHNODE_PUBLICATION_ID;
    if (!publicationId) {
        console.warn('HASHNODE_PUBLICATION_ID is not set.');
        return [];
    }

    try {
        const data: any = await hashnodeClient.request(GET_POSTS_QUERY, {
            publicationId,
            first,
        });
        return data.publication?.posts?.edges.map((edge: any) => edge.node) || [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    const publicationId = process.env.HASHNODE_PUBLICATION_ID;
    if (!publicationId) return null;

    try {
        const data: any = await hashnodeClient.request(GET_POST_QUERY, {
            publicationId,
            slug,
        });
        return data.publication?.post || null;
    } catch (error) {
        console.error(`Error fetching post ${slug}:`, error);
        return null;
    }
}
