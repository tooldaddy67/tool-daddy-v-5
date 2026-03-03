export type HitSeverity = "light" | "medium" | "heavy";

export interface HitEvent {
    type: string;
    time_unix_ms: number;
    amplitude: number;
    severity: HitSeverity;
    source: "mac-accelerometer" | "mic";
}

export interface KnockMicConfig {
    onHit: (event: HitEvent) => void;
    threshold?: number;
    cooldownMs?: number;
}
