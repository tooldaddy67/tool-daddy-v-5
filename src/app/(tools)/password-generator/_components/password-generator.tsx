
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Copy, Check, RefreshCw, Wand2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import zxcvbn from 'zxcvbn';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [strength, setStrength] = useState({ label: 'Weak', color: 'bg-red-500', score: 0 });
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { firestore, user } = useFirebase();

  // Generate password without side effects (no history/notifications)
  const generatePasswordOnly = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    // Fallback if nothing selected
    if (!charset) {
      charset = lower;
    }

    let newPassword = '';
    const crypto = window.crypto;
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      // Use modulus to pick a character from the charset
      // This is cryptographically secure as we're using crypto.getRandomValues
      newPassword += charset[values[i] % charset.length];
    }

    setPassword(newPassword);
    setIsCopied(false);
    return newPassword;
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  // Save to history and send notification
  const savePasswordAction = useCallback((actionType: 'generated' | 'copied') => {
    // Save to history
    addToHistory({
      tool: 'Password Generator',
      data: {
        passwordLength: length,
        details: `${actionType === 'generated' ? 'Generated' : 'Copied'} a ${length} character password.`
      }
    });

    // Send notification
    sendNotification(firestore, user?.uid, {
      title: actionType === 'generated' ? 'Password Generated' : 'Password Copied',
      message: `A ${length}-character password has been ${actionType === 'generated' ? 'created' : 'copied to clipboard'}.`,
      type: 'success',
      link: '/password-generator'
    });
  }, [length, addToHistory, firestore, user]);

  // Handle regenerate button click
  const handleRegenerate = useCallback(() => {
    generatePasswordOnly();
    savePasswordAction('generated');
  }, [generatePasswordOnly, savePasswordAction]);

  const copyToClipboard = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    toast({ title: 'Password Copied!', description: 'The generated password has been copied to your clipboard.' });
    setTimeout(() => setIsCopied(false), 2000);

    // Save to history and send notification on copy
    savePasswordAction('copied');
  }, [password, toast, savePasswordAction]);

  // Calculate strength based on zxcvbn entropy analysis
  useEffect(() => {
    if (!password) {
      setStrength({ label: 'None', color: 'bg-muted', score: 0 });
      return;
    }

    const analysis = zxcvbn(password);
    const score = analysis.score; // 0-4

    let label = 'Very Weak';
    let color = 'bg-red-500';

    switch (score) {
      case 0: label = 'Very Weak'; color = 'bg-red-600'; break;
      case 1: label = 'Weak'; color = 'bg-red-400'; break;
      case 2: label = 'Medium'; color = 'bg-yellow-500'; break;
      case 3: label = 'Strong'; color = 'bg-blue-500'; break;
      case 4: label = 'Very Secure'; color = 'bg-green-500'; break;
    }

    setStrength({ label, color, score: (score + 1) * 2 }); // Scale to 10 for bar
  }, [password]);

  // Initial generation (no history/notification on mount)
  useEffect(() => {
    generatePasswordOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Controls Column */}
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg border-border/20 h-fit">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="length">Length</Label>
                <span className="font-mono text-lg font-bold bg-muted px-2 py-0.5 rounded text-primary">{length}</span>
              </div>
              <Slider
                id="length"
                min={6}
                max={64}
                step={1}
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
                <Switch id="uppercase" checked={includeUppercase} onCheckedChange={(c) => {
                  if (!c && !includeLowercase && !includeNumbers && !includeSymbols) return; // Prevent unchecking all
                  setIncludeUppercase(c);
                }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
                <Switch id="lowercase" checked={includeLowercase} onCheckedChange={(c) => {
                  if (!c && !includeUppercase && !includeNumbers && !includeSymbols) return;
                  setIncludeLowercase(c);
                }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
                <Switch id="numbers" checked={includeNumbers} onCheckedChange={(c) => {
                  if (!c && !includeUppercase && !includeLowercase && !includeSymbols) return;
                  setIncludeNumbers(c);
                }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#)</Label>
                <Switch id="symbols" checked={includeSymbols} onCheckedChange={(c) => {
                  if (!c && !includeUppercase && !includeLowercase && !includeNumbers) return;
                  setIncludeSymbols(c);
                }} />
              </div>
            </div>

            <Button onClick={handleRegenerate} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
            </Button>
          </CardContent>
        </Card>

        {/* Output Column */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-lg border-border/20 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Generated Password</CardTitle>
            <CardDescription>Securely generated on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 flex-grow flex flex-col justify-center">

            <div className="relative group w-full flex-grow flex items-center justify-center p-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center justify-center bg-card border border-border rounded-xl p-4 md:p-8 shadow-sm w-full min-h-[120px]">
                <div className={cn(
                  "font-mono break-all text-center tracking-wider text-foreground transition-all duration-300",
                  length <= 16 ? "text-3xl md:text-4xl" :
                    length <= 24 ? "text-2xl md:text-3xl" :
                      length <= 32 ? "text-xl md:text-2xl" :
                        "text-lg"
                )}>
                  {password}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex flex-col gap-1 w-full order-2 md:order-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Security Strength</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-muted rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", strength.color)} style={{ width: `${(strength.score / 10) * 100}%` }}></div>
                  </div>
                  <span className={cn("text-xs font-bold min-w-[70px] text-right uppercase", strength.color.replace('bg-', 'text-'))}>{strength.label}</span>
                </div>
              </div>
              <Button
                size="default"
                variant="ghost"
                onClick={copyToClipboard}
                className={cn(
                  "w-full transition-all duration-300 order-1 md:order-2 h-12 text-base font-medium overflow-hidden relative border",
                  isCopied
                    ? "border-green-500 text-green-500 bg-transparent shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-green-500/10"
                    : "border-border hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                )}
              >
                <div className={cn("flex items-center justify-center gap-2 transition-all duration-300 transform", isCopied ? "scale-105" : "scale-100")}>
                  {isCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                  <span>{isCopied ? "Copied!" : "Copy Password"}</span>
                </div>
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
