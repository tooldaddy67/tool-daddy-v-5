const API_ENDPOINT = 'https://gql.hashnode.com';

export const GET_POSTS_QUERY = `
  query GetPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      id
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
  query GetPost($host: String!, $slug: String!) {
    publication(host: $host) {
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
  const host = 'tooldaddy.hashnode.dev';
  const token = process.env.HASHNODE_ACCESS_TOKEN;

  try {
    // Add a timestamp to the URL to bypass Next.js Data Cache entirely
    const url = `${API_ENDPOINT}?t=${Date.now()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify({
        query: GET_POSTS_QUERY,
        variables: { host, first },
      }),
      cache: 'no-store'
    });

    if (!response.ok) return [];

    const json = await response.json();
    const posts = json.data?.publication?.posts?.edges.map((edge: any) => edge.node) || [];
    return posts;
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const host = 'tooldaddy.hashnode.dev';
  const token = process.env.HASHNODE_ACCESS_TOKEN;

  try {
    const url = `${API_ENDPOINT}?t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify({
        query: GET_POST_QUERY,
        variables: { host, slug },
      }),
      cache: 'no-store'
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.publication?.post || null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}
