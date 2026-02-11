/**
 * @fileOverview This file defines the AI Playlist Generator flow.
 * - generatePlaylist - An async function that takes a prompt and returns a list of songs.
 */
import { createFlowAi } from '@/ai/genkit';
import { z } from 'zod';

const ai = createFlowAi('playlist');

const SongSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  album: z.string().describe('The album the song is from.'),
  year: z.number().describe('The year the song was released.'),
  thumbnailUrl: z.string().optional().describe('URL to the song album art.'),
});

export const PlaylistInputSchema = z.object({
  prompt: z.string().describe('A description of the vibe or theme for the playlist.'),
});
export type PlaylistInput = z.infer<typeof PlaylistInputSchema>;

export const PlaylistOutputSchema = z.object({
  playlistName: z.string().describe('A creative name for the generated playlist.'),
  songs: z.array(SongSchema).describe('A list of 10 songs that fit the prompt.'),
});
export type PlaylistOutput = z.infer<typeof PlaylistOutputSchema>;

export async function generatePlaylist(input: PlaylistInput): Promise<PlaylistOutput> {
  return generatePlaylistFlow(input);
}

const playlistPrompt = ai.definePrompt({
  name: 'generatePlaylistPrompt',
  input: { schema: PlaylistInputSchema },
  output: { schema: PlaylistOutputSchema },
  prompt: `Role: You are a Music Curator AI with access to a real-time audio analysis engine. 
Task: Generate a playlist of 10 songs based on the user's prompt.

Instruction:
1. First, analyze the user's prompt to determine the target audio feature values:
   - Mood/Valence: 0.0 (Sad/Depressed) to 1.0 (Happy/Euphoric)
   - Energy: 0.0 (Calm/Acoustic) to 1.0 (Intense/Loud)
   - Danceability: 0.0 (Static) to 1.0 (Club-ready)
   - BPM: Ideal tempo range (e.g., 120-130).

2. Select 10 real-world songs that align perfectly with these determined audio features.
3. Constraint: Do NOT guess or hallucinate song attributes. Use your internal knowledge to verify data accuracy.
4. The playlist should have a creative name reflecting the prompt.

Output Requirement:
ONLY output the requested JSON object. Do NOT provide character dialog or chatbot responses.

Prompt:
"""
{{prompt}}
"""
`,
});

async function fetchThumbnail(title: string, artist: string): Promise<string | undefined> {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    const data = await response.json();
    return data.results?.[0]?.artworkUrl100?.replace('100x100', '400x400'); // Get higher res
  } catch (error) {
    console.error('Error fetching thumbnail for:', title, error);
    return undefined;
  }
}

const generatePlaylistFlow = ai.defineFlow(
  {
    name: 'generatePlaylistFlow',
    inputSchema: PlaylistInputSchema,
    outputSchema: PlaylistOutputSchema,
  },
  async (input) => {
    const { output } = await playlistPrompt(input);
    if (!output) {
      throw new Error('The AI did not return a valid playlist.');
    }

    // Fetch real-world thumbnails for each song in parallel
    const songsWithThumbnails = await Promise.all(
      output.songs.map(async (song) => {
        const thumb = await fetchThumbnail(song.title, song.artist);
        return {
          ...song,
          thumbnailUrl: thumb,
        };
      })
    );

    return {
      ...output,
      songs: songsWithThumbnails,
    };
  }
);
