'use server';

import { generatePlaylist, type PlaylistInput, type PlaylistOutput } from '@/ai/flows/generate-playlist';

export async function generatePlaylistAction(input: PlaylistInput): Promise<{ data: PlaylistOutput | null, error: string | null }> {
  try {
    return await generatePlaylist(input);
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to generate playlist'
    };
  }
}
