'use server';

import { generatePlaylist, type PlaylistInput, type PlaylistOutput } from '@/ai/flows/generate-playlist';
import { checkPersistentRateLimit } from '@/lib/rate-limiter';

const MAX_PROMPT_LENGTH = 300;

export async function generatePlaylistAction(input: PlaylistInput): Promise<{ data: PlaylistOutput | null, error: string | null }> {
  // Input validation
  if (!input.prompt || typeof input.prompt !== 'string') {
    return { data: null, error: 'A prompt is required.' };
  }
  if (input.prompt.length > MAX_PROMPT_LENGTH) {
    return { data: null, error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.` };
  }

  // Server-side rate limiting
  const rateLimit = await checkPersistentRateLimit('ai-playlist-maker');
  if (!rateLimit.allowed) {
    return { data: null, error: `Rate limit exceeded. Please try again in ${rateLimit.resetTime ?? 60} seconds.` };
  }

  try {
    return await generatePlaylist(input);
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to generate playlist'
    };
  }
}
