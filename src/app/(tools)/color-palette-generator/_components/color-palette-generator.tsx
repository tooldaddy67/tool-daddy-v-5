'use client';

import { useState, useEffect, useMemo } from 'react';
import PaletteCard from '@/components/palette-card';
import { mockPalettes, type Palette } from '@/lib/palettes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Paintbrush, Plus, RefreshCw, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';
import { useSettings } from '@/components/settings-provider';

const STORAGE_KEY = 'userColorPalettes';

export default function ColorPaletteGenerator() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { addToHistory } = useHistory();
  const [palettes, setPalettes] = useState<Palette[]>(mockPalettes);
  const [localPalettes, setLocalPalettes] = useState<Palette[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isYourPalettesDialogOpen, setIsYourPalettesDialogOpen] = useState(false);
  const [colors, setColors] = useState<[string, string, string, string]>(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']);

  // Load user palettes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocalPalettes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load palettes from localStorage:', error);
    } finally {
      setIsLocalLoaded(true);
    }
  }, []);

  // Palettes (FORCE LOCAL)
  const userPalettes = localPalettes;

  // Sync to Cloud disabled

  // Function to shuffle an array (Fisher-Yates shuffle)
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  // Generate random hex color
  const generateRandomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
  };

  // Generate all random colors
  const generateRandomPalette = () => {
    setColors([
      generateRandomColor(),
      generateRandomColor(),
      generateRandomColor(),
      generateRandomColor(),
    ]);
  };

  // Handle color input change
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors] as [string, string, string, string];
    newColors[index] = value || '#000000';
    setColors(newColors);
  };

  // Save the palette
  const handleSavePalette = async () => {
    const paletteId = Date.now().toString();
    const newPalette: Palette = {
      id: paletteId,
      colors: colors,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPalette, ...localPalettes];
    setLocalPalettes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast({ title: "Palette saved locally" });

    addToHistory({
      tool: 'Color Palette',
      data: { details: `Saved new color palette: ${colors.join(', ')}` }
    });

    // Reset form and close dialog
    setColors(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']);
    setIsDialogOpen(false);
  };

  // Delete user palette
  const handleDeletePalette = async (id: string) => {
    const updated = localPalettes.filter(p => p.id !== id);
    setLocalPalettes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast({ title: "Palette deleted locally" });
  };

  const handleReload = () => {
    const shuffledPalettes = shuffleArray([...mockPalettes]);
    setPalettes(shuffledPalettes);
  };

  // Copy color to clipboard
  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color.toUpperCase());
    toast({
      title: `Copied ${color.toUpperCase()}`,
    });
  };

  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Paintbrush /> Color Palette Generator</CardTitle>
            <CardDescription>Discover, create, and share beautiful color palettes.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-col">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleReload} aria-label="Reload Palettes">
                <RefreshCw />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="purple"><Plus className="mr-2" /> Create</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Color Palette</DialogTitle>
                    <DialogDescription>
                      Choose 4 colors for your palette or generate random ones.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Colors</label>
                      <div className="space-y-3">
                        {colors.map((color, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => handleColorChange(index, e.target.value)}
                              className="h-10 w-16 cursor-pointer rounded border border-input"
                            />
                            <Input
                              type="text"
                              value={color}
                              onChange={(e) => handleColorChange(index, e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={generateRandomPalette}
                      className="w-full"
                    >
                      Generate Random Colors
                    </Button>
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePalette}
                        className="flex-1"
                      >
                        Save Palette
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {userPalettes.length > 0 && (
              <Dialog open={isYourPalettesDialogOpen} onOpenChange={setIsYourPalettesDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto"><Paintbrush className="mr-2 h-4 w-4" /> Your Palettes ({userPalettes.length})</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Your Palettes</DialogTitle>
                    <DialogDescription>
                      Manage and view all your created color palettes
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {userPalettes.map((palette) => (
                      <Card key={palette.id} className="bg-card/50 backdrop-blur-lg border-border/20 overflow-hidden">
                        <div className="space-y-0">
                          <div className="relative group">
                            <div className="flex h-40 gap-1 p-2">
                              {palette.colors.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 rounded-lg transition-all cursor-pointer hover:scale-105 relative group/color"
                                  style={{ backgroundColor: color }}
                                >
                                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/color:opacity-100 transition-opacity flex items-center justify-end pr-2">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-white text-xs font-mono font-bold text-right">
                                        {color}
                                      </span>
                                      <button
                                        onClick={() => handleCopyColor(color)}
                                        className="bg-white/20 hover:bg-white/40 p-1 rounded transition-colors"
                                        title="Copy color"
                                      >
                                        <Copy className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePalette(palette.id)}
                              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Generated Palettes Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Explore Palettes</h2>
        <div className="columns-1 gap-6 sm:columns-2 md:columns-3 lg:columns-4">
          {palettes.map((palette) => (
            <PaletteCard key={palette.id} palette={palette} />
          ))}
        </div>
      </div>
    </div>
  );
}
