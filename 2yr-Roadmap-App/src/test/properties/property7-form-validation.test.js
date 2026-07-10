import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateForm } from '../../components/CreateRoadmapForm.jsx';

/**
 * Property 7: Form Validation Completeness
 * Validates: Requirements 6.2, 6.4
 *
 * For any roadmap creation input where the title is a non-empty string of 1-100 characters,
 * dates form a valid range (end >= start), and 1-20 categories each have labels of 1-30 characters,
 * the form SHALL accept the input. For any input violating any of these constraints,
 * the form SHALL reject it and display appropriate inline error messages.
 */
describe('Feature: roadmap-dashboard, Property 7: Form Validation Completeness', () => {
  // --- Arbitraries ---

  /** Generate a valid title: non-empty, 1-100 printable characters (trimmed result is non-empty) */
  const validTitle = fc.string({ minLength: 1, maxLength: 100, unit: 'grapheme' })
    .filter((s) => s.trim().length > 0 && s.trim().length <= 100);

  /** Generate a valid subtitle: 0-200 characters */
  const validSubtitle = fc.string({ minLength: 0, maxLength: 200, unit: 'grapheme' });

  /** Generate a valid ISO date pair where end >= start */
  const validDateRange = fc
    .tuple(
      fc.integer({ min: 2020, max: 2040 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 }),
      fc.integer({ min: 0, max: 365 })
    )
    .map(([year, month, day, offsetDays]) => {
      const start = new Date(year, month - 1, day);
      const end = new Date(start.getTime() + offsetDays * 86400000);
      const fmt = (d) => d.toISOString().slice(0, 10);
      return { startDate: fmt(start), endDate: fmt(end) };
    });

  /** Generate a valid category label: 1-30 non-empty trimmed characters */
  const validCategoryLabel = fc.string({ minLength: 1, maxLength: 30, unit: 'grapheme' })
    .filter((s) => s.trim().length > 0 && s.trim().length <= 30);

  /** Generate a single valid category */
  const validCategory = validCategoryLabel.map((label) => ({
    label,
    bg: '#0F6E56',
    color: '#ffffff',
  }));

  /** Generate a valid categories array: 1-20 items */
  const validCategories = fc.array(validCategory, { minLength: 1, maxLength: 20 });

  /** Generate a complete valid form input */
  const validFormInput = fc
    .tuple(validTitle, validSubtitle, validDateRange, validCategories)
    .map(([title, subtitle, { startDate, endDate }, categories]) => ({
      title,
      subtitle,
      startDate,
      endDate,
      categories,
    }));

  // --- Property: Valid inputs are always accepted ---

  it('valid inputs always produce an empty errors object (accepted)', () => {
    fc.assert(
      fc.property(validFormInput, (input) => {
        const errors = validateForm(input);
        expect(Object.keys(errors)).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  // --- Properties: Invalid inputs are always rejected with appropriate errors ---

  it('empty title is rejected with a title error', () => {
    fc.assert(
      fc.property(validSubtitle, validDateRange, validCategories, (subtitle, { startDate, endDate }, categories) => {
        const errors = validateForm({ title: '', subtitle, startDate, endDate, categories });
        expect(errors.title).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('title exceeding 100 characters is rejected with a title error', () => {
    const longTitle = fc.string({ minLength: 101, maxLength: 200, unit: 'grapheme' })
      .filter((s) => s.trim().length > 100);

    fc.assert(
      fc.property(longTitle, validSubtitle, validDateRange, validCategories, (title, subtitle, { startDate, endDate }, categories) => {
        const errors = validateForm({ title, subtitle, startDate, endDate, categories });
        expect(errors.title).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('end date before start date is rejected with an endDate error', () => {
    const invalidDateRange = fc
      .tuple(
        fc.integer({ min: 2020, max: 2040 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 1, max: 365 })
      )
      .map(([year, month, day, offsetDays]) => {
        const end = new Date(year, month - 1, day);
        const start = new Date(end.getTime() + offsetDays * 86400000);
        const fmt = (d) => d.toISOString().slice(0, 10);
        return { startDate: fmt(start), endDate: fmt(end) };
      });

    fc.assert(
      fc.property(validTitle, validSubtitle, invalidDateRange, validCategories, (title, subtitle, { startDate, endDate }, categories) => {
        const errors = validateForm({ title, subtitle, startDate, endDate, categories });
        expect(errors.endDate).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('empty categories array is rejected with a categories error', () => {
    fc.assert(
      fc.property(validTitle, validSubtitle, validDateRange, (title, subtitle, { startDate, endDate }) => {
        const errors = validateForm({ title, subtitle, startDate, endDate, categories: [] });
        expect(errors.categories).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('more than 20 categories is rejected with a categories error', () => {
    const tooManyCategories = fc.array(validCategory, { minLength: 21, maxLength: 25 });

    fc.assert(
      fc.property(validTitle, validSubtitle, validDateRange, tooManyCategories, (title, subtitle, { startDate, endDate }, categories) => {
        const errors = validateForm({ title, subtitle, startDate, endDate, categories });
        expect(errors.categories).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('category with empty label is rejected with categoryItems error', () => {
    fc.assert(
      fc.property(validTitle, validSubtitle, validDateRange, (title, subtitle, { startDate, endDate }) => {
        const categories = [{ label: '', bg: '#0F6E56', color: '#ffffff' }];
        const errors = validateForm({ title, subtitle, startDate, endDate, categories });
        expect(errors.categoryItems).toBeDefined();
        expect(errors.categoryItems[0]).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('category with label exceeding 30 characters is rejected with categoryItems error', () => {
    const longLabel = fc.string({ minLength: 31, maxLength: 60, unit: 'grapheme' })
      .filter((s) => s.trim().length > 30);

    fc.assert(
      fc.property(validTitle, validSubtitle, validDateRange, longLabel, (title, subtitle, { startDate, endDate }, label) => {
        const categories = [{ label, bg: '#0F6E56', color: '#ffffff' }];
        const errors = validateForm({ title, subtitle, startDate, endDate, categories });
        expect(errors.categoryItems).toBeDefined();
        expect(errors.categoryItems[0]).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('missing start date is rejected with a startDate error', () => {
    fc.assert(
      fc.property(validTitle, validSubtitle, validCategories, (title, subtitle, categories) => {
        const errors = validateForm({ title, subtitle, startDate: '', endDate: '2025-01-01', categories });
        expect(errors.startDate).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('missing end date is rejected with an endDate error', () => {
    fc.assert(
      fc.property(validTitle, validSubtitle, validCategories, (title, subtitle, categories) => {
        const errors = validateForm({ title, subtitle, startDate: '2025-01-01', endDate: '', categories });
        expect(errors.endDate).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});
