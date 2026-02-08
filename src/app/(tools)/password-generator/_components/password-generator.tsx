
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [strength, setStrength] = useState({ label: 'Weak', color: 'bg-red-500' });
  const { toast } = useToast();

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    // Enforce standard strong password policy
    if (length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      setPassword('');
      return;
    }
    if (!includeUppercase || !includeLowercase || !includeNumbers || !includeSymbols) {
      toast({
        title: 'Weak Password',
        description: 'Password must include uppercase, lowercase, number, and symbol.',
        variant: 'destructive',
      });
      setPassword('');
      return;
    }
    if (!charset) {
      toast({
        title: 'Error',
        description: 'You must select at least one character type.',
        variant: 'destructive',
      });
      setPassword('');
      return;
    }

    let newPassword = '';
    const crypto = window.crypto;
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      newPassword += charset[values[i] % charset.length];
    }

    setPassword(newPassword);
    setIsCopied(false);
  };
  
  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    toast({ title: 'Password Copied!', description: 'The generated password has been copied to your clipboard.' });
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  useEffect(() => {
    generatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);
  
  useEffect(() => {
    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (includeUppercase) score++;
    if (includeLowercase) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;

    if (score < 3) setStrength({ label: 'Very Weak', color: 'bg-red-700' });
    else if (score < 4) setStrength({ label: 'Weak', color: 'bg-red-500' });
    else if (score < 5) setStrength({ label: 'Medium', color: 'bg-yellow-500' });
    else if (score < 7) setStrength({ label: 'Strong', color: 'bg-green-500' });
    else setStrength({ label: 'Very Strong', color: 'bg-green-700' });

  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);


  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound /> Password Generator</CardTitle>
          <CardDescription>Create strong, secure, and random passwords.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              value={password}
              readOnly
              placeholder="Your generated password will appear here"
              className="pr-20 h-12 text-lg font-mono"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Button variant="ghost" size="icon" onClick={generatePassword}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Strength:</Label>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-white", strength.color)}>{strength.label}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="length">Password Length: {length}</Label>
              <Slider
                id="length"
                min={8}
                max={64}
                step={1}
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                variant="red"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                  <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                  <Label htmlFor="lowercase">Include Lowercase (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                  <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                  <Label htmlFor="symbols">Include Symbols (!@#...)</Label>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
