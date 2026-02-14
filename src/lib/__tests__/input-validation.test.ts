import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeFileName, validateUrl } from '../input-validation';

describe('input-validation', () => {
    describe('sanitizeString', () => {
        it('should remove script tags', () => {
            const input = 'Hello <script>alert("xss")</script> world';
            expect(sanitizeString(input)).toBe('Hello  world');
        });

        it('should remove event handlers', () => {
            const input = '<div onclick="alert(1)">Click me</div>';
            expect(sanitizeString(input)).toBe('<div>Click me</div>');
        });

        it('should remove javascript: protocol', () => {
            const input = '<a href="javascript:alert(1)">Link</a>';
            expect(sanitizeString(input)).toBe('<a href="alert(1)">Link</a>');
        });

        it('should truncate long strings', () => {
            const input = 'a'.repeat(60000);
            expect(sanitizeString(input).length).toBe(50000);
        });

        it('should handle non-string inputs gracefully', () => {
            // @ts-ignore
            expect(sanitizeString(null)).toBe('');
            // @ts-ignore
            expect(sanitizeString(undefined)).toBe('');
        });
    });

    describe('sanitizeFileName', () => {
        it('should remove path traversal attempts', () => {
            expect(sanitizeFileName('../../../etc/passwd')).toBe('etcpasswd');
            expect(sanitizeFileName('test/file.txt')).toBe('testfile.txt');
        });

        it('should limit file name length', () => {
            const longName = 'a'.repeat(300) + '.txt';
            const sanitized = sanitizeFileName(longName);
            expect(sanitized.length).toBe(255);
            expect(sanitized.endsWith('.txt')).toBe(true);
        });
    });

    describe('validateUrl', () => {
        it('should allow http and https', () => {
            expect(validateUrl('https://google.com')).toBe(true);
            expect(validateUrl('http://localhost:3000')).toBe(true);
        });

        it('should disallow other protocols', () => {
            expect(validateUrl('ftp://files.com')).toBe(false);
            expect(validateUrl('file:///etc/passwd')).toBe(false);
            expect(validateUrl('data:text/html,xss')).toBe(false);
        });
    });
});
