import { HitSeverity, KnockMicConfig } from "./types";

let audioCtx: AudioContext | null = null;
let stream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let isDetecting = false;
let animationFrameId: number;

export async function startMicKnockDetection({
    onHit,
    threshold = 0.20,
    cooldownMs = 600,
}: KnockMicConfig): Promise<(() => void) | null> {
    if (isDetecting) return stopMicKnockDetection;

    try {
        if (!window.isSecureContext) {
            throw new Error("Microphone API requires a Secure Context (HTTPS or localhost). Check your connection.");
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Microphone API not supported or not available in this context.");
        }

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();

        // We want a fast, sharp response, so a small FFT size
        analyser.fftSize = 512;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        isDetecting = true;
        let lastHitTime = 0;

        const detectKnock = () => {
            if (!isDetecting || !analyser) return;

            analyser.getByteTimeDomainData(dataArray);
            let maxAmplitude = 0;

            for (let i = 0; i < bufferLength; i++) {
                // Values range from 0 to 255. 128 is zero signal.
                const normalized = Math.abs(dataArray[i] - 128) / 128;
                if (normalized > maxAmplitude) {
                    maxAmplitude = normalized;
                }
            }

            if (maxAmplitude > threshold) {
                const now = Date.now();
                if (now - lastHitTime > cooldownMs) {
                    lastHitTime = now;

                    let severity: HitSeverity = "light";
                    if (maxAmplitude >= 0.45) severity = "heavy";
                    else if (maxAmplitude >= 0.25) severity = "medium";

                    onHit({
                        type: "hit",
                        time_unix_ms: now,
                        amplitude: maxAmplitude,
                        severity,
                        source: "mic"
                    });
                }
            }

            animationFrameId = requestAnimationFrame(detectKnock);
        };

        detectKnock();

        return stopMicKnockDetection;

    } catch (err: any) {
        console.error("Microphone Detection Error:", err);
        return null; // Return null so the caller knows it failed without crashing
    }
}

export function stopMicKnockDetection() {
    isDetecting = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (audioCtx) {
        audioCtx.close().catch(console.error);
        audioCtx = null;
    }

    analyser = null;
}
