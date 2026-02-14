'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Copy, Check, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function SqlFormatterClient() {
    const [input, setInput] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const formatSql = () => {
        if (!input.trim()) return;

        // Basic SQL formatting logic (Keyword Uppercasing + Newlines)
        // This is a simplified formatter. 
        let formatted = input
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([,;()])\s*/g, '$1 ') // Fix spacing around punctuation
            .replace(/\(\s+/g, '(')
            .replace(/\s+\)/g, ')')

        // Keywords to uppercase and add newlines
        const keywords = [
            "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY",
            "HAVING", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE",
            "SET", "DELETE FROM", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
            "OUTER JOIN", "ON", "UNION", "CREATE TABLE", "DROP TABLE", "ALTER TABLE"
        ];

        // Case insensitive Replace
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            formatted = formatted.replace(regex, `\n${kw}`);
        });

        // Special handling for SELECT to be first line if possible
        formatted = formatted.trim();

        // Simple Indentation
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const indented = lines.map(line => {
            line = line.trim();
            if (!line) return '';

            // rudimentary indentation logic can be complex without a parser
            return line;
        }).join('\n');

        setInput(formatted); // Update input with formatted text
        toast({ title: 'SQL Formatted' });
    };

    const clearInput = () => {
        setInput('');
    };

    const copyToClipboard = () => {
        if (!input) return;
        navigator.clipboard.writeText(input);
        setIsCopied(true);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Database className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">SQL Formatter</h1>
                <p className="text-muted-foreground">Format and beautify your SQL queries.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium">SQL Editor</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={formatSql} disabled={!input}>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Format
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!input}>
                            {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearInput} disabled={!input}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="SELECT * FROM users WHERE id = 1..."
                        className="min-h-[500px] font-mono text-sm resize-y bg-background/50"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        spellCheck={false}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
