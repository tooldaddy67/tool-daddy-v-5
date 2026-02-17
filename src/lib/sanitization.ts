/**
 * Sanitizes a string by trimming it and removing potentially dangerous HTML tags.
 * This is a basic protection against simple XSS and injection.
 */
export function sanitizeString(str: string): string {
    if (!str) return '';
    return str
        .trim()
        .replace(/[<>]/g, '') // Basic tag removal
        .substring(0, 10000); // Reasonable length limit
}

/**
 * Sanitizes an object by applying basic sanitization to all its string properties.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeString(sanitized[key]) as any;
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized;
}
