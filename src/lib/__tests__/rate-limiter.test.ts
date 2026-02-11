import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock next/headers since it's a server-only module
vi.mock('next/headers', () => ({
    headers: vi.fn(() => ({
        get: vi.fn(() => null),
    })),
}));

// Import after mocking
import { checkRateLimit } from '../rate-limiter';

describe('checkRateLimit', () => {
    beforeEach(() => {
        // Clear the internal rate limit store between tests
        // Since the store is module-scoped, we need a fresh import
        // For simplicity, we test with unique identifiers per test
    });

    it('should allow requests under the limit', () => {
        const id = `test-allow-${Date.now()}`;
        expect(checkRateLimit(id, 5, 60000)).toBe(true);
        expect(checkRateLimit(id, 5, 60000)).toBe(true);
        expect(checkRateLimit(id, 5, 60000)).toBe(true);
    });

    it('should block requests over the limit', () => {
        const id = `test-block-${Date.now()}`;
        const limit = 3;

        // Use up the limit
        expect(checkRateLimit(id, limit, 60000)).toBe(true);
        expect(checkRateLimit(id, limit, 60000)).toBe(true);
        expect(checkRateLimit(id, limit, 60000)).toBe(true);

        // Should be blocked now
        expect(checkRateLimit(id, limit, 60000)).toBe(false);
        expect(checkRateLimit(id, limit, 60000)).toBe(false);
    });

    it('should reset after the time window expires', async () => {
        const id = `test-reset-${Date.now()}`;
        const limit = 2;
        const windowMs = 100; // 100ms window for fast test

        expect(checkRateLimit(id, limit, windowMs)).toBe(true);
        expect(checkRateLimit(id, limit, windowMs)).toBe(true);
        expect(checkRateLimit(id, limit, windowMs)).toBe(false);

        // Wait for window to expire
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Should be allowed again
        expect(checkRateLimit(id, limit, windowMs)).toBe(true);
    });

    it('should track different identifiers independently', () => {
        const id1 = `test-independent-a-${Date.now()}`;
        const id2 = `test-independent-b-${Date.now()}`;

        expect(checkRateLimit(id1, 1, 60000)).toBe(true);
        expect(checkRateLimit(id1, 1, 60000)).toBe(false); // blocked

        expect(checkRateLimit(id2, 1, 60000)).toBe(true); // different ID, still allowed
    });
});
