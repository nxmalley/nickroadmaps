import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import RoadmapView from '../../components/RoadmapView.jsx';
import { DEFAULT_TEXT_COLOR, DEFAULT_BG_COLOR } from '../../constants/defaults.js';

/**
 * Property 3: Unknown Category Key Fallback
 *
 * For any task whose `cat` field references a key not present in the roadmap's
 * `categories` object, the rendered task SHALL use `--color-text-secondary` for
 * text color and `--color-background-secondary` for background color.
 *
 * **Validates: Requirements 3.7**
 */

/**
 * Helper to build a minimal valid roadmap with a single task using the given category key.
 */
function makeRoadmapWithTask(catKey, taskText, categories) {
  return {
    id: 'test-roadmap',
    title: 'Test',
    subtitle: 'Test sub',
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    accentColors: ['#0F6E56'],
    categories,
    phases: [{
      id: 'p1',
      title: 'Phase 1',
      subtitle: 'Test phase',
      dateRange: 'Jan – Dec',
      milestones: [],
      weeks: [{
        id: 'w1',
        label: 'Week 1',
        dates: 'Jan 1–7',
        tasks: [{ id: 'task-1', cat: catKey, text: taskText }]
      }]
    }],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('Property 3: Unknown Category Key Fallback', () => {
  afterEach(() => {
    cleanup();
  });

  it('tasks with unknown category keys use default secondary styling', () => {
    fc.assert(
      fc.property(
        // Generate a category key that's definitely NOT in the known categories map
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !['cert', 'skill'].includes(s) && /^[a-z][a-z0-9]*$/.test(s)),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // task text
        (unknownCatKey, taskText) => {
          // Define a known categories object that does NOT contain the generated key
          const categories = {
            cert: { label: 'Cert', bg: '#1a2b3c', color: '#ffffff' },
            skill: { label: 'Skill', bg: '#2b3c4d', color: '#ffffff' },
          };

          const roadmap = makeRoadmapWithTask(unknownCatKey, taskText, categories);
          const { container } = render(
            <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
          );

          // Find the category tag span — it displays the raw key as its text content
          // because unknown categories use the key itself as the label
          const allSpans = container.querySelectorAll('span');
          const catTag = Array.from(allSpans).find(span => span.textContent === unknownCatKey);

          // The tag must exist and use default fallback styling
          expect(catTag).toBeTruthy();
          expect(catTag.style.background).toBe(DEFAULT_BG_COLOR);
          expect(catTag.style.color).toBe(DEFAULT_TEXT_COLOR);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });
});
