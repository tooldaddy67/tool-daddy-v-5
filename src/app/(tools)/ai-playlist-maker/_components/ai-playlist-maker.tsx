'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { Loader2, Wand2, Music, Play, X } from 'lucide-react';
import { type PlaylistOutput } from '@/ai/flows/generate-playlist';
import { generatePlaylistAction } from '../_actions/generate';
import Image from 'next/image';
import AdModal from '@/components/ad-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToolAd } from '@/hooks/use-tool-ad';
import { useQuota } from '@/hooks/use-quota';

interface NowPlaying {
  title: string;
  artist: string;
}

export default function AiPlaylistMaker() {
  const [userPrompt, setUserPrompt] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useFirebase();
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const { isAdOpen, setIsAdOpen, showAd, handleAdFinish, duration, title: adTitle } = useToolAd('heavy_ai');
  const { checkQuota, incrementUsage, loading: isQuotaLoading } = useQuota();
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuota = async () => {
      const q = await checkQuota('ai-playlist-maker');
      setQuotaRemaining(q.remaining);
    };
    if (user) fetchQuota();
  }, [user, checkQuota]);

  // Helper function to generate YouTube Music search URL for direct music videos
  const getYoutubeSearchUrl = (title: string, artist: string) => {
    const query = `${title} ${artist}`;
    // Use YouTube Music for better music video results
    return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  };

  // Handle playing a song
  const handlePlaySong = (title: string, artist: string) => {
    setNowPlaying({ title, artist });
  };

  // Generate YouTube Music embed URL
  const getYouTubeMusicEmbedUrl = (title: string, artist: string) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    // Direct link to YouTube Music search
    return `https://music.youtube.com/search?q=${query}`;
  };

  const handleGenerateClick = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a vibe or theme for your playlist.',
        variant: 'destructive',
      });
      return;
    }

    const q = await checkQuota('ai-playlist-maker');
    if (!q.allowed) {
      toast({
        title: 'Quota Exceeded',
        description: 'You have reached your daily limit for this tool. Please try again tomorrow.',
        variant: 'destructive'
      });
      return;
    }

    showAd(performGeneration);
  };

  const performGeneration = async () => {
    setIsLoading(true);
    setPlaylist(null);

    const result = await generatePlaylistAction({ prompt: userPrompt });

    if (result.error) {
      const isMaintenance = result.error.includes('SITE_MAINTENANCE');
      toast({
        title: isMaintenance ? 'System Maintenance' : 'An Error Occurred',
        description: isMaintenance ? result.error.replace('SITE_MAINTENANCE: ', '') : result.error,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setPlaylist(result.data);
      await incrementUsage('ai-playlist-maker');
      const q = await checkQuota('ai-playlist-maker');
      setQuotaRemaining(q.remaining);

      addToHistory({
        tool: 'AI Playlist Maker',
        data: {
          playlistName: result.data.playlistName,
          songs: result.data.songs,
        }
      });

      sendNotification(null, user?.uid, {
        title: 'Playlist Generated',
        message: `Playlist "${result.data.playlistName}" has been created.`,
        type: 'success',
        link: '/ai-playlist-maker'
      });
    }

    setIsLoading(false);
  };


  const examplePrompts = [
    "Rainy day coding session",
    "80s synthwave driving at night",
    "Chill lofi beats for studying",
    "Acoustic coffee shop vibes",
    "High-energy workout mix"
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-grow flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
            <CardHeader>
              <CardTitle>AI Playlist Maker</CardTitle>
              <CardDescription>
                Describe a mood, vibe, or theme, and let AI create the perfect playlist for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
              <Textarea
                placeholder="e.g., 'A workout playlist with 90s hip-hop hits' or 'sad songs for walking in the rain'"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="h-full resize-none min-h-[150px]"
                disabled={isLoading}
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Or try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map(p => (
                    <Button key={p} variant="outline" size="sm" onClick={() => setUserPrompt(p)} disabled={isLoading}>
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleGenerateClick} disabled={isLoading} variant="purple" size="lg" className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            Generate Playlist
          </Button>
        </div>

        <Card className="flex-1 flex flex-col bg-background/80 border-border/20">
          <CardHeader>
            <CardTitle>{playlist?.playlistName || 'Your Playlist'}</CardTitle>
            <CardDescription>
              {playlist ? 'Here are the songs for your listening pleasure.' : 'Your generated playlist will appear here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="relative flex-grow">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <p className="mt-4 text-muted-foreground">Crafting your playlist...</p>
                </div>
              )}
              {!isLoading && !playlist && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                  <Music className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Ready for some tunes?</p>
                  <p className="text-sm">Enter a prompt and hit generate!</p>
                </div>
              )}
              {playlist && (
                <ScrollArea className="h-full max-h-[600px] pr-4">
                  <ul className="space-y-4">
                    {playlist.songs.map((song, index) => (
                      <li key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-500/10 transition-all hover:border-purple-500/50 border border-transparent">
                        <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => handlePlaySong(song.title, song.artist)}>
                          <Image
                            src={song.thumbnailUrl || `https://placehold.co/400x400/8B5CF6/white?text=${encodeURIComponent(song.title.charAt(0))}`}
                            alt={`${song.album} album art`}
                            width={64}
                            height={64}
                            className="rounded-md object-cover bg-muted"
                            unoptimized={!!song.thumbnailUrl} // iTunes URLs are usually external and optimized enough
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 rounded-md transition-colors">
                            <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                          <p className="text-xs text-muted-foreground/80">{song.album} ({song.year})</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlaySong(song.title, song.artist)}
                          className="flex-shrink-0 hover:bg-purple-500/20 hover:border-purple-500 hover:text-purple-400 transition-colors"
                        >
                          <Play className="h-4 w-4 mr-1 fill-current" />
                          Play
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onAdFinish={handleAdFinish}
        title={adTitle}
        duration={duration}
      />

      {/* YouTube Player Modal */}
      <Dialog open={!!nowPlaying} onOpenChange={(open) => !open && setNowPlaying(null)}>
        <DialogContent className="w-full max-w-4xl h-[90vh] max-h-[900px] p-0 border-0 bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Now Playing: {nowPlaying?.title}</DialogTitle>
          </DialogHeader>
          {nowPlaying && (
            <div className="w-full h-full flex flex-col bg-background rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-b border-border/20">
                <div className="flex-1 pr-8">
                  <h3 className="font-bold text-lg text-foreground truncate">{nowPlaying.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{nowPlaying.artist}</p>
                </div>
              </div>

              {/* Music Hub Content */}
              <div className="flex-1 w-full flex flex-col items-center justify-center p-6 md:p-12 bg-background relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full" />

                {/* Album Art / Icon */}
                <div className="relative mb-8 group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-card border border-border/50 rounded-xl p-8 shadow-2xl">
                    <Music className="h-24 w-24 text-purple-400 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-2 mb-10 z-10">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    {nowPlaying.title}
                  </h2>
                  <p className="text-xl text-purple-400 font-medium">{nowPlaying.artist}</p>
                </div>

                {/* Platform Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md z-10">
                  <a
                    href={`https://music.youtube.com/search?q=${encodeURIComponent(`${nowPlaying.title} ${nowPlaying.artist}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full h-14 text-lg border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all gap-3">
                      <Play className="h-5 w-5 fill-red-500 text-red-500" />
                      YouTube Music
                    </Button>
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${nowPlaying.title} ${nowPlaying.artist}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full h-14 text-lg border-red-500/30 hover:bg-red-500/10 hover:border-red-500 transition-all gap-3">
                      <Play className="h-5 w-5 fill-red-600 text-red-600" />
                      YouTube
                    </Button>
                  </a>
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(`${nowPlaying.title} ${nowPlaying.artist}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:col-span-2"
                  >
                    <Button variant="outline" className="w-full h-14 text-lg border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-all gap-3">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-green-500" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.3c-.22.36-.67.48-1.03.26-2.85-1.74-6.44-2.12-10.66-1.16-.41.09-.82-.17-.92-.58-.09-.41.17-.82.58-.92 4.62-1.06 8.6-1.06 11.77.88.36.22.48.67.26 1.03zm1.46-3.26c-.28.44-.85.59-1.29.31-3.26-2.01-8.23-2.6-12.08-1.43-.5.15-1.03-.14-1.17-.64-.15-.5.14-1.03.64-1.17 4.41-1.34 9.89-.69 13.6 1.59.43.27.58.84.3 1.34zm.13-3.4c-3.91-2.32-10.36-2.54-14.13-1.39-.6.18-1.24-.16-1.42-.76-.18-.6.16-1.24.76-1.42 4.31-1.31 11.44-1.06 15.96 1.63.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.57.38z" /></svg>
                      Open in Spotify
                    </Button>
                  </a>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    Universal links used to ensure the best listening experience on any device.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
