'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Languages, Copy, Check, RefreshCw, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Basic Romaji to Katakana mapping for name transliteration
const ROMAJI_TO_KANA: Record<string, string> = {
    'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
    'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
    'sa': 'サ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
    'ta': 'タ', 'ti': 'チ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',
    'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
    'ha': 'ハ', 'hi': 'ヒ', 'fu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
    'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
    'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    'wa': 'ワ', 'wo': 'ヲ', 'n': 'ン',
    'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
    'za': 'ザ', 'zi': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
    'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',
    'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
    'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
    'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
    'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ',
    'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ',
    'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
    'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
    'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
    'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
    'gya': 'ギャ', 'gyu': 'ギュ', 'gyo': 'ギョ',
    'ja': 'ジャ', 'ju': 'ジュ', 'jo': 'ジョ',
    'bya': 'ビャ', 'byu': 'ビュ', 'byo': 'ビョ',
    'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ',
    'tsu': 'ツ', 'shi': 'シ', 'chi': 'チ', 'zu': 'ズ'
};

const KATA_TO_HIRA: Record<string, string> = {
    'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
    'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
    'サ': 'さ', 'し': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
    'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
    'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
    'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
    'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
    'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
    'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
    'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
    'ガ': 'が', 'ギ': 'ぎ', 'グ': 'ぐ', 'ゲ': 'げ', 'ゴ': 'ご',
    'ザ': 'ざ', 'ジ': 'じ', 'ズ': 'ず', 'ゼ': 'ぜ', 'ゾ': 'ぞ',
    'ダ': 'だ', 'ヂ': 'ぢ', 'ヅ': 'づ', 'デ': 'で', 'ド': 'ど',
    'バ': 'ば', 'ビ': 'び', 'ブ': 'ぶ', 'ベ': 'べ', 'ボ': 'ぼ',
    'パ': 'ぱ', 'ピ': 'ぴ', 'プ': 'ぷ', 'ペ': 'ぺ', 'ポ': 'ぽ',
    'キャ': 'きゃ', 'キュ': 'きゅう', 'キョ': 'きょ',
    'シャ': 'しゃ', 'シュ': 'しゅ', 'ショ': 'しょ',
    'チャ': 'ちゃ', 'チュ': 'ちゅ', 'チョ': 'ちょ',
    'ニャ': 'にゃ', 'ニュ': 'にゅう', 'ニョ': 'にょ',
    'ヒャ': 'ひゃ', 'ヒュ': 'ひゅう', 'ヒョ': 'ひょ',
    'ミャ': 'みゃ', 'ミュ': 'みゅう', 'ミョ': 'みょ',
    'リャ': 'りゃ', 'リュ': 'りゅう', 'リョ': 'りょ',
    'ギャ': 'ぎゃ', 'ギュ': 'ぎゅう', 'ギョ': 'ぎょ',
    'ジャ': 'じゃ', 'ジュ': 'じゅ', 'ジョ': 'じょ',
    'ビャ': 'びゃ', 'ビュ': 'びゅう', 'ビョ': 'びょ',
    'ピャ': 'ぴゃ', 'ピュ': 'ぴゅう', 'ピョ': 'ぴょ',
    'ツ': 'つ', 'シ': 'し', 'チ': 'ち', 'ズ': 'ず'
};

export default function JapaneseNameConverter() {
    const [name, setName] = useState('');
    const [katakana, setKatakana] = useState('');
    const [hiragana, setHiragana] = useState('');
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const convert = (val: string) => {
        const input = val.toLowerCase().replace(/[^a-z\s]/g, '');
        setName(val);

        if (!input) {
            setKatakana('');
            setHiragana('');
            return;
        }

        let resultKata = '';
        let i = 0;
        const words = input.split(/\s+/);

        const convertedWords = words.map(word => {
            let wordKata = '';
            let p = 0;
            while (p < word.length) {
                // Try 3 chars
                if (p + 3 <= word.length && ROMAJI_TO_KANA[word.substring(p, p + 3)]) {
                    wordKata += ROMAJI_TO_KANA[word.substring(p, p + 3)];
                    p += 3;
                }
                // Try 2 chars
                else if (p + 2 <= word.length && ROMAJI_TO_KANA[word.substring(p, p + 2)]) {
                    wordKata += ROMAJI_TO_KANA[word.substring(p, p + 2)];
                    p += 2;
                }
                // Try 1 char
                else if (ROMAJI_TO_KANA[word[p]]) {
                    wordKata += ROMAJI_TO_KANA[word[p]];
                    p += 1;
                }
                // Double consonants (e.g. 'kk')
                else if (p + 1 < word.length && word[p] === word[p + 1] && word[p] !== 'n' && word[p] !== 'a' && word[p] !== 'i' && word[p] !== 'u' && word[p] !== 'e' && word[p] !== 'o') {
                    wordKata += 'ッ';
                    p += 1;
                }
                else {
                    p += 1; // Skip unknown
                }
            }
            return wordKata;
        });

        resultKata = convertedWords.join(' ');
        setKatakana(resultKata);

        // Convert Katakana to Hiragana (simple mapping)
        let resultHira = resultKata;
        Object.entries(KATA_TO_HIRA).forEach(([kata, hira]) => {
            resultHira = resultHira.split(kata).join(hira);
        });
        setHiragana(resultHira);
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Languages className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Japanese Name Converter</h1>
                <p className="text-muted-foreground">Convert your name into Katakana and Hiragana. Ideal for learners and curious souls.</p>
            </div>

            <Card className="glass-panel mb-8 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="name-input">Enter Name in English/Romaji</Label>
                        <Input
                            id="name-input"
                            value={name}
                            onChange={(e) => convert(e.target.value)}
                            placeholder="e.g. Tanaka, John, Sakura"
                            className="h-14 text-xl font-medium"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel overflow-hidden group">
                    <div className="p-1 bg-gradient-to-r from-orange-500/20 to-red-500/20" />
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Katakana (カタカナ)</CardTitle>
                            <CardDescription>Commonly used for foreign names.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(katakana, 'kata')} disabled={!katakana}>
                            {copiedField === 'kata' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className={`text-6xl font-black transition-all ${katakana ? 'opacity-100 scale-100' : 'opacity-10 scale-90'}`}>
                            {katakana || 'NAME'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-panel overflow-hidden group">
                    <div className="p-1 bg-gradient-to-r from-blue-500/20 to-teal-500/20" />
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Hiragana (ひらがな)</CardTitle>
                            <CardDescription>The backbone of Japanese script.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(hiragana, 'hira')} disabled={!hiragana}>
                            {copiedField === 'hira' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className={`text-6xl font-black transition-all ${hiragana ? 'opacity-100 scale-100' : 'opacity-10 scale-90'}`}>
                            {hiragana || 'なまえ'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Fun Facts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted-foreground">
                    <p>
                        **Katakana** is used specifically for foreign loanwords, names of foreign people, and places. That's why your name is usually written in Katakana!
                    </p>
                    <p>
                        **Hiragana** is the basic phonetic script used for native Japanese words and grammar particles. It is the first script Japanese children learn.
                    </p>
                </div>
            </div>
        </div>
    );
}
