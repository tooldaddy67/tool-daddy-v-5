import { HitSeverity } from "./types";

const SOUND_PACK = [
    "aaaaah-spank.mp3",
    "aight-fuck-you-bitch.mp3",
    "daddy-who-is-your-daddy-and-what-does-he-do.mp3",
    "daddyeggs-3-daddy-eggs.mp3",
    "moan10.mp3",
    "moaning.mp3",
    "name-is-john-cena.mp3",
    "ohh-yeah-daddy-oh-baby-daddy-yes-show-us-your-scar-and-tell-the-crazy-story-on-how-you-got.mp3",
    "woman-moaning-extremely-loud.mp3"
];

const audioPool: HTMLAudioElement[] = [];
let isPlaying = false;

export function unlockAudio() {
    if (typeof window === "undefined") return;

    // Load and unlock every sound in the pack to prevent browser blocking
    SOUND_PACK.forEach(filename => {
        const audio = new Audio(`/sound pack/${filename}`);
        audio.preload = "auto";
        audio.load();

        // Attempt to "unlock" by playing silently
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {
            // Ignore autoplay restriction errors
        });

        audioPool.push(audio);
    });
}

export function playHitSound(severity: HitSeverity = "medium") {
    if (typeof window === "undefined" || audioPool.length === 0 || isPlaying) return;

    // Pick a random sound from the pool
    const randomIndex = Math.floor(Math.random() * audioPool.length);
    const audio = audioPool[randomIndex];

    if (!audio) return;

    isPlaying = true;

    // Reset and sets volume based on severity
    audio.currentTime = 0;

    if (severity === "light") {
        audio.volume = 0.4;
    } else if (severity === "medium") {
        audio.volume = 0.7;
    } else {
        audio.volume = 1.0;
    }

    audio.onended = () => {
        isPlaying = false;
    };

    audio.play().catch((err) => {
        console.debug("Audio playback failed:", err);
        isPlaying = false;
    });
}

export function stopAllSounds() {
    audioPool.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    isPlaying = false;
}
