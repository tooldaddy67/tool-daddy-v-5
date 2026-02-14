import { describe, it, expect } from 'vitest';
import { formatBytes, getFileExtension, cn } from '../utils';

describe('utils', () => {
    describe('formatBytes', () => {
        it('should format bytes correctly', () => {
            expect(formatBytes(0)).toBe('0 Bytes');
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1048576)).toBe('1 MB');
            expect(formatBytes(1073741824)).toBe('1 GB');
        });

        it('should handle decimal places', () => {
            expect(formatBytes(1500)).toBe('1.46 KB');
        });
    });

    describe('getFileExtension', () => {
        it('should extract extension correctly', () => {
            expect(getFileExtension('test.jpg')).toBe('jpg');
            expect(getFileExtension('archive.tar.gz')).toBe('gz');
            expect(getFileExtension('noextension')).toBe('');
        });
    });

    describe('cn', () => {
        it('should merge tailwind classes', () => {
            expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4');
            expect(cn('p-4 p-8')).toBe('p-8'); // Tailwind merge logic
        });
    });
});
