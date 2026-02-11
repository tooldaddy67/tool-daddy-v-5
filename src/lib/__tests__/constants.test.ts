import { describe, it, expect } from 'vitest';
import { TOOL_CATEGORIES, ALL_TOOLS } from '../constants';

describe('TOOL_CATEGORIES', () => {
    it('should have at least 5 categories', () => {
        expect(TOOL_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    });

    it('each category should have a name and tools array', () => {
        TOOL_CATEGORIES.forEach((category) => {
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('tools');
            expect(Array.isArray(category.tools)).toBe(true);
            expect(category.tools.length).toBeGreaterThan(0);
        });
    });

    it('each tool should have name, href, and icon', () => {
        TOOL_CATEGORIES.forEach((category) => {
            category.tools.forEach((tool) => {
                expect(tool).toHaveProperty('name');
                expect(tool).toHaveProperty('href');
                expect(tool).toHaveProperty('icon');
                expect(tool.href).toMatch(/^\//);
            });
        });
    });

    it('should not have duplicate tool hrefs', () => {
        const hrefs = ALL_TOOLS.map((t) => t.href);
        const uniqueHrefs = new Set(hrefs);
        expect(uniqueHrefs.size).toBe(hrefs.length);
    });
});

describe('ALL_TOOLS', () => {
    it('should contain all tools from all categories', () => {
        const totalFromCategories = TOOL_CATEGORIES.reduce(
            (sum, cat) => sum + cat.tools.length,
            0
        );
        expect(ALL_TOOLS.length).toBe(totalFromCategories);
    });

    it('should have at least 20 tools', () => {
        expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(20);
    });
});
