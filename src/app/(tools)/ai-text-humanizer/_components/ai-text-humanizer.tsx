'use client';

import { useState, useEffect } from 'react';
import { humanizeText } from '@/ai/flows/humanize-ai-text';
import { type HumanizeTextInput } from '@/ai/flows/humanize-ai-text.types';
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
import { Loader2, Wand2, Copy, Check, Info } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import AdModal from '@/components/ad-modal';
import { Badge } from '@/components/ui/badge';
import { useToolAd } from '@/hooks/use-tool-ad';

const StyleSlider = ({ label, value, onChange, variant, helpText }: { label: string, value: number, onChange: (value: number) => void, variant: any, helpText: string }) => (
  <div className="space-y-2 group" title={helpText}>
    <div className="flex justify-between items-center">
      <Label htmlFor={`${label}-slider`}>{label}</Label>
      <span className="text-xs font-mono px-2 py-1 rounded-md bg-muted/50 group-hover:bg-accent transition-colors">{value}</span>
    </div>
    <Slider
      id={`${label}-slider`}
      min={0}
      max={10}
      step={1}
      value={[value]}
      onValueChange={(val) => onChange(val[0])}
      variant={variant}
    />
  </div>
)

export default function AiTextHumanizer() {
  const { isAdOpen, setIsAdOpen, showAd, handleAdFinish, duration, title: adTitle } = useToolAd('heavy_ai');
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useFirebase();

  const [warmth, setWarmth] = useState(5);
  const [formality, setFormality] = useState(5);
  const [directness, setDirectness] = useState(5);
  const [conciseness, setConciseness] = useState(5);

  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number | null, limit: number | null }>({ remaining: null, limit: 4 });
  const [cooldownTime, setCooldownTime] = useState(0);

  const MAX_CHAR_LIMIT = 3000;

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);


  const handleHumanizeClick = () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to humanize.',
        variant: 'destructive',
      });
      return;
    }

    if (inputText.length > MAX_CHAR_LIMIT) {
      toast({
        title: 'Character Limit Exceeded',
        description: `Please limit your input to ${MAX_CHAR_LIMIT} characters. You are currently using ${inputText.length}.`,
        variant: 'destructive',
      });
      return;
    }

    if (cooldownTime > 0) {
      toast({
        title: 'Rate Limit Active',
        description: `Please wait ${cooldownTime} more seconds before trying again.`,
        variant: 'destructive'
      });
      return;
    }

    showAd(performHumanize);
  };

  const handleError = (error: any) => {
    let description = 'An unknown error occurred. Please try again.';
    let isMaintenance = false;

    if (typeof error === 'string') {
      description = error;
    } else if (error instanceof Error) {
      description = error.message;
    }

    if (description.includes('SITE_MAINTENANCE')) {
      isMaintenance = true;
      description = description.replace('SITE_MAINTENANCE: ', '');
    } else if (description.startsWith('Rate limit exceeded.')) {
      const timeMatch = description.match(/(\d+)/);
      if (timeMatch) {
        const time = parseInt(timeMatch[1], 10);
        setCooldownTime(time);
        setRateLimitInfo(prev => ({ ...prev, remaining: 0 }));
      }
      console.error('Rate limit triggered:', description);
    } else {
      console.error('Error during humanization process:', error);
    }

    toast({
      title: isMaintenance ? 'System Maintenance' : 'An Error Occurred',
      description,
      variant: 'destructive',
    });
  };

  const performHumanize = async () => {
    setIsLoading(true);
    setHumanizedText('');
    setIsCopied(false);

    try {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        await (window as any).grecaptcha.ready(async () => {
          await (window as any).grecaptcha.execute('6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF', { action: 'humanize_text' });
        });
      }
    } catch (error) {
      console.error('reCAPTCHA error:', error);
    }

    const input: HumanizeTextInput = { text: inputText, style: { warmth, formality, directness, conciseness } };
    const result = await humanizeText(input);

    setIsLoading(false);

    if (result.error) {
      handleError(result.error);
      return;
    }

    if (result.data) {
      setHumanizedText(result.data.humanizedText);
      setRateLimitInfo({ remaining: result.data.remaining, limit: result.data.limit });

      addToHistory({
        tool: 'AI Text Humanizer',
        data: { inputText, humanizedText: result.data.humanizedText },
      });

      sendNotification(null, user?.uid, {
        title: 'Text Humanized',
        message: 'Your text has been successfully humanized.',
        type: 'success',
        link: '/ai-text-humanizer'
      });
    }
  }

  const handleCopy = () => {
    if (!humanizedText) return;
    navigator.clipboard.writeText(humanizedText);
    setIsCopied(true);
    toast({ title: 'Copied!', description: 'The humanized text has been copied to your clipboard.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isButtonDisabled = isLoading || cooldownTime > 0;

  return (
    <>
      <div className="w-full h-full flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-grow flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Enter the AI-generated text you want to humanize. Max {MAX_CHAR_LIMIT} characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow relative">
                <Textarea
                  placeholder="Paste your AI-generated text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="h-full resize-none min-h-[200px]"
                  disabled={isLoading}
                  maxLength={MAX_CHAR_LIMIT + 500}
                />
                <div className="absolute bottom-2 right-3 text-xs text-muted-foreground tabular-nums">
                  {inputText.length} / {MAX_CHAR_LIMIT}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-lg border-border/20">
            <CardHeader>
              <CardTitle>Style Controls</CardTitle>
              <CardDescription>Adjust the tone of the output.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <StyleSlider label="Warmth" value={warmth} onChange={setWarmth} variant="orange" helpText="Controls friendliness and empathy. High = supportive, Low = neutral." />
              <StyleSlider label="Formality" value={formality} onChange={setFormality} variant="blue" helpText="Controls casual vs professional wording. High = formal, Low = casual." />
              <StyleSlider label="Directness" value={directness} onChange={setDirectness} variant="red" helpText="Controls blunt vs straight to the point, Low = indirect/soft." />
              <StyleSlider label="Conciseness" value={conciseness} onChange={setConciseness} variant="green" helpText="Controls length. High = shorter and tighter, Low = more detail." />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground text-center p-2 rounded-lg bg-muted/50">
              <Info className="h-4 w-4" />
              <span>Limit: {rateLimitInfo.limit || 4} requests per minute.</span>
              {rateLimitInfo.remaining !== null && (
                <Badge variant="secondary">{rateLimitInfo.remaining} / {rateLimitInfo.limit} remaining</Badge>
              )}
            </div>
            <Button onClick={handleHumanizeClick} disabled={isButtonDisabled} variant="blue" size="lg" className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : cooldownTime > 0 ? (
                `Try again in ${cooldownTime}s`
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              {!isLoading && cooldownTime === 0 && 'Humanize Text'}
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col bg-background/80 border-border/20">
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              Your humanized text will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="relative flex-grow">
              <Textarea
                placeholder="Humanized text..."
                value={humanizedText}
                readOnly
                className="h-full resize-none bg-muted/50 min-h-[200px]"
              />
              {humanizedText && (
                <Button variant="ghost" size="icon" onClick={handleCopy} className="absolute top-2 right-2">
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
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
    </>
  );
}
