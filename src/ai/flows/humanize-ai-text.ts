'use server';
/**
 * @fileOverview This file defines a function for rewriting text to sound more human, with style controls.
 *
 * - humanizeText - An async function that takes text and style parameters and rewrites it.
 */
import { humanizerSystemPrompt } from './prompts/humanizer-prompt';
import { type HumanizeTextInput, type HumanizeTextOutput } from './humanize-ai-text.types';
import { headers } from 'next/headers';
import { adminFirestore } from '@/lib/firebase-admin';
import { createFlowAi } from '@/ai/genkit';
import admin from 'firebase-admin';
import { checkMaintenanceMode } from '@/app/actions/system-config';
import { checkPersistentRateLimit } from '@/lib/rate-limiter';

const ai = createFlowAi('humanizer');

function levelLabel(v: number): string {
    if (v <= 2) return "low";
    if (v <= 4) return "medium-low";
    if (v === 5) return "medium";
    if (v <= 7) return "medium-high";
    return "high";
}

const RATE_LIMIT_COUNT = 4;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds

// The function now returns a structured object to avoid throwing unhandled server errors.
export async function humanizeText(input: HumanizeTextInput): Promise<{ data: HumanizeTextOutput | null; error: string | null; }> {
    try {
        // --- Phase 0: Maintenance Check ---
        await checkMaintenanceMode();

        // --- Phase 2: Rate Limit Enforcement ---
        const rateLimit = await checkPersistentRateLimit('ai-text-humanizer');

        if (!rateLimit.allowed) {
            throw new Error(`Rate limit exceeded. Please try again in ${rateLimit.resetTime} seconds.`);
        }

        // 2. If not, proceed with AI call
        const { text, style } = input;
        const { warmth, formality, directness, conciseness } = style;

        const instructionPrompt = `You are a text-rewriting engine. Your task is to rewrite the "ORIGINAL TEXT" based on the "STYLE SETTINGS".
Do NOT respond to the text. Do NOT act like a chatbot. ONLY output the rewritten text.

STYLE SETTINGS:
- Warmth: ${levelLabel(warmth)} (${warmth}/10)
- Formality: ${levelLabel(formality)} (${formality}/10)
- Directness: ${levelLabel(directness)} (${directness}/10)
- Conciseness: ${levelLabel(conciseness)} (${conciseness}/10)

ORIGINAL TEXT:
"""
${text}
"""

REWRITTEN TEXT:
`;

        const llmResponse = await ai.generate({
            prompt: instructionPrompt,
            system: humanizerSystemPrompt,
        });

        const fullContent = llmResponse.text;

        if (!fullContent) {
            throw new Error("The AI did not return any content.");
        }

        // 3. Log is already handled by checkPersistentRateLimit

        // 4. Return the result with rate limit info
        return {
            data: {
                humanizedText: fullContent.trim(),
                remaining: rateLimit.remaining,
                limit: rateLimit.limit,
            },
            error: null
        };
    } catch (e: any) {
        console.error("Humanizer Error:", e.message); // For server-side debugging
        return { data: null, error: e.message || "An unexpected server error occurred." };
    }
}
