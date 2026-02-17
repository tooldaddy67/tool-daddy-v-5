'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Notebook, Bold, Italic, Highlighter, Download, Loader2, Trash2, Brush, Maximize, Minimize, ChevronDown, Paintbrush, List, ListOrdered, Heading1, Heading2, Heading3, Pilcrow } from 'lucide-react';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AdModal from '@/components/ad-modal';
import DOMPurify from 'dompurify';
import '../styles.css';

const LOCAL_STORAGE_KEY = 'rich-notepad-content';

const FONT_LIST = [
  { name: 'Default', value: 'sans-serif' },
  { name: 'Anonymous Pro', value: '"Anonymous Pro", monospace' },
  { name: 'Bebas Neue', value: '"Bebas Neue", cursive' },
  { name: 'Caveat', value: 'Caveat, cursive' },
  { name: 'EB Garamond', value: '"EB Garamond", serif' },
  { name: 'Inconsolata', value: 'Inconsolata, monospace' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Lobster', value: 'Lobster, cursive' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'PT Serif', value: '"PT Serif", serif' },
  { name: 'Pacifico', value: 'Pacifico, cursive' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { name: 'Space Mono', value: '"Space Mono", monospace' },
];

import { useSettings } from '@/components/settings-provider';

export default function SimpleNotepad() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { settings } = useSettings();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [fileName, setFileName] = useState('notepad-export');
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isTxtDialogOpen, setIsTxtDialogOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<'pdf' | 'txt' | null>(null);

  const [toolbar, setToolbar] = useState({ visible: false, top: 0, left: 0 });
  const [activeStyle, setActiveStyle] = useState('Paragraph');

  // Load Initial Content (Local only)
  useEffect(() => {
    if (isAuthLoading) return;

    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedContent) {
      const sanitized = DOMPurify.sanitize(savedContent);
      if (editorRef.current) editorRef.current.innerHTML = sanitized;
      setContent(sanitized);
      updateCounts(sanitized);
    }

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('paste', handlePaste);
    }

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      if (editor) {
        editor.removeEventListener('paste', handlePaste);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, !!user]);

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  };


  const updateCounts = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
  }

  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    if (downloadType === 'pdf') {
      setIsPdfDialogOpen(true);
    } else if (downloadType === 'txt') {
      setIsTxtDialogOpen(true);
    }
  };
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const rawContent = e.currentTarget.innerHTML;
    const sanitizedContent = DOMPurify.sanitize(rawContent);
    setContent(sanitizedContent);
    localStorage.setItem(LOCAL_STORAGE_KEY, sanitizedContent);
    updateCounts(sanitizedContent);
  };

  const handleClear = () => {
    setContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    updateCounts('');
    toast({ title: 'Notepad Cleared' });
  };

  const handleDownloadPdf = async () => {
    if (!editorRef.current || !content.trim()) {
      toast({ title: "Notepad is empty", description: "Write something before downloading.", variant: 'destructive' });
      return;
    }

    setIsDownloading(true);
    setIsPdfDialogOpen(false);
    toast({ title: "Generating PDF..." });

    try {
      const editor = editorRef.current;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      await pdf.html(editor, {
        callback: function (doc) {
          doc.save(`${fileName}.pdf`);
        },
        x: 15,
        y: 15,
        width: 550,
        windowWidth: editor.scrollWidth,
      });


      toast({ title: "PDF Downloaded!", description: "Your notes have been saved as a PDF." });
    } catch (error) {
      console.error("Failed to generate PDF", error);
      toast({ title: "Error", description: "Could not generate PDF.", variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!editorRef.current || !content.trim()) {
      toast({ title: "Notepad is empty", description: "Write something before downloading.", variant: 'destructive' });
      return;
    }
    setIsTxtDialogOpen(false);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "TXT Downloaded!", description: "Your notes have been saved as a text file." });
  };

  const triggerAdForDownload = (type: 'pdf' | 'txt') => {
    if (!content.trim()) {
      toast({ title: "Notepad is empty", description: "Write something before downloading.", variant: 'destructive' });
      return;
    }
    setDownloadType(type);
    setIsAdModalOpen(true);
  };

  const applyFormat = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput({ currentTarget: editorRef.current } as any);
    }
  };

  const applyBlockFormat = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleSelectionChange(); // Re-check style after applying
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!editor) return;

    // Check if the selection is inside the editor
    if (selection && selection.rangeCount > 0 && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      const range = selection.getRangeAt(0);

      // Update active style for dropdown
      const block = document.queryCommandValue('formatBlock');
      const styleMap: { [key: string]: string } = {
        p: 'Paragraph',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
      };
      setActiveStyle(styleMap[block.toLowerCase()] || 'Paragraph');
    }
  }, []);


  useEffect(() => {
    const handleMouseUp = () => {
      // Use a small timeout to allow the selection to update before we check it
      setTimeout(handleSelectionChange, 1);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleSelectionChange]);

  // Fixed Toolbar styling
  const ToolbarComponent = () => {
    const handleToolbarMouseDown = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent losing focus from editor
    };

    return (
      <div
        className="flex items-center gap-1 p-2 border-b bg-muted/20 backdrop-blur-sm sticky top-0 z-20 w-full overflow-x-auto"
        onMouseDown={handleToolbarMouseDown}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="w-24 justify-between" title="Font">
              <span className="truncate">Font</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onFocusOutside={e => e.preventDefault()} className="max-h-60 overflow-y-auto z-50">
            {FONT_LIST.map(font => (
              <DropdownMenuItem
                key={font.name}
                onSelect={() => applyFormat('fontName', font.value)}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-6 bg-border mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="w-32 justify-between" title="Text Styles">
              <span className="truncate">{activeStyle}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onFocusOutside={e => e.preventDefault()} className="z-50">
            <DropdownMenuItem onSelect={() => applyBlockFormat('p')}>
              <Pilcrow className="h-4 w-4 mr-2" /> Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyBlockFormat('h1')}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyBlockFormat('h2')}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyBlockFormat('h3')}>
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-6 bg-border mx-1"></div>

        <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" onClick={() => applyFormat('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" onClick={() => applyFormat('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-6 bg-border mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" title="Highlight color">
              <Paintbrush className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onFocusOutside={e => e.preventDefault()} className="z-50">
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#ca8a0480')}>
              <Highlighter className="h-4 w-4 mr-2 text-yellow-400" /> Yellow
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#22c55e80')}>
              <Highlighter className="h-4 w-4 mr-2 text-green-400" /> Green
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#ec489980')}>
              <Highlighter className="h-4 w-4 mr-2 text-pink-400" /> Pink
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#f9731680')}>
              <Highlighter className="h-4 w-4 mr-2 text-orange-400" /> Orange
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#3b82f680')}>
              <Highlighter className="h-4 w-4 mr-2 text-blue-400" /> Blue
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', '#a855f780')}>
              <Highlighter className="h-4 w-4 mr-2 text-purple-400" /> Purple
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => applyFormat('hiliteColor', 'transparent')}>
              <Brush className="h-4 w-4 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-6 bg-border mx-1"></div>

        <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" onClick={() => applyFormat('insertUnorderedList')} title="Bulleted List">
          <List className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-8 w-8 shrink-0" variant="ghost" onClick={() => applyFormat('insertOrderedList')} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
    )
  };

  return (
    <>
      <div className={cn("w-full h-full p-2 md:p-6", isFullScreen && "p-0 md:p-0")}>
        <Card className={cn(
          "w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20 transition-all duration-300 max-w-full overflow-x-hidden",
          isFullScreen && "fixed inset-0 z-40 rounded-none border-none"
        )}>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
            <div>
              <CardTitle className="flex items-center gap-2"><Notebook /> Simple Notepad</CardTitle>
              <CardDescription className="hidden sm:block">Your notes are automatically saved. Download them as you wish.</CardDescription>
            </div>
            <div className="flex flex-wrap sm:flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isDownloading} title="Download notes">
                      {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => triggerAdForDownload('pdf')} title="Download as PDF">As PDF</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => triggerAdForDownload('txt')} title="Download as Text">As Plain Text (.txt)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Download as PDF</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="filename-pdf" className="text-right">Filename</Label>
                        <Input id="filename-pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} className="col-span-3" onKeyDown={(e) => { if (e.key === 'Enter') handleDownloadPdf() }} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isTxtDialogOpen} onOpenChange={setIsTxtDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Download as Plain Text</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="filename-txt" className="text-right">Filename</Label>
                        <Input id="filename-txt" value={fileName} onChange={(e) => setFileName(e.target.value)} className="col-span-3" onKeyDown={(e) => { if (e.key === 'Enter') handleDownloadTxt() }} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDownloadTxt}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleClear} title="Clear all notes">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="border border-input rounded-md flex-grow flex flex-col relative min-h-[70vh] overflow-hidden max-w-full">
              <ToolbarComponent />
              <div
                ref={editorRef}
                contentEditable={true}
                onInput={handleInput}
                suppressContentEditableWarning={true}
                className="prose prose-sm dark:prose-invert max-w-none p-6 bg-background focus:outline-none flex-grow overflow-y-auto break-words whitespace-pre-wrap"
                data-placeholder="Start typing..."
              />
              <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)} className="absolute bottom-3 right-3 z-10" title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                {isFullScreen ? <Minimize /> : <Maximize />}
                <span className="sr-only">{isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Preparing your download..."
        duration={10}
      />
    </>
  );
}
