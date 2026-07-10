import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, fireEvent, cleanup } from '@testing-library/react';
import RoadmapView from '../../components/RoadmapView.jsx';

/**
 * Property 12: Accent Color by Phase Index
 * Validates: Requirements 9.4
 *
 * For any roadmap with an accent color array of length K and an active phase
 * at index I (where 0 <= I < K), the rendered active phase button SHALL use
 * accentColors[I] as its border color.
 */

/**
 * Convert a hex color string to its rgb() equivalent as browsers render it.
 * e.g. "#0a3214" -> "rgb(10, 50, 20)"
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function makeRoadmap(numPhases, accentColors) {
  const phases = Array.from({ length: numPhases }, (_, i) => ({
    id: `p${i}`,
    title: `Phase ${i + 1}`,
    subtitle: `Subtitle ${i + 1}`,
    dateRange: `Range ${i + 1}`,
    milestones: [],
    weeks: [{
      id: `p${i}w1`,
      label: 'Week 1',
      dates: 'Jan 1–7',
      tasks: [{ id: `p${i}w1t1`, cat: 'test', text: `Task in phase ${i + 1}` }]
    }]
  }));

  return {
    id: 'test-roadmap',
    title: 'Test',
    subtitle: 'Test',
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    accentColors,
    categories: { test: { label: 'Test', bg: '#333333', color: '#ffffff' } },
    phases,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('Property 12: Accent Color by Phase Index', () => {
  it('active phase button uses accentColors[activePhaseIndex] for its border', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        (numPhases) => {
          // Generate distinct hex colors for each phase
          const accentColors = Array.from({ length: numPhases }, (_, i) =>
            `#${(i * 30 + 10).toString(16).padStart(2, '0')}${(i * 20 + 50).toString(16).padStart(2, '0')}${(i * 40 + 20).toString(16).padStart(2, '0')}`
          );

          const roadmap = makeRoadmap(numPhases, accentColors);
          const { container } = render(
            <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
          );

          // Phase 0 is active by default — its button border should contain the accent color (as rgb)
          const buttons = container.querySelectorAll('button');
          const expectedRgb0 = hexToRgb(accentColors[0]);
          expect(buttons[0].style.border).toContain(expectedRgb0);

          // Click a different phase
          const targetIndex = numPhases - 1;
          fireEvent.click(buttons[targetIndex]);

          // Now the target phase button should have its accent color in the border
          const updatedButtons = container.querySelectorAll('button');
          const expectedRgbTarget = hexToRgb(accentColors[targetIndex]);
          expect(updatedButtons[targetIndex].style.border).toContain(expectedRgbTarget);

          cleanup();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('clicking any phase index I applies accentColors[I] to the active button border', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        fc.nat(),
        (numPhases, indexSeed) => {
          const targetIndex = indexSeed % numPhases;

          // Generate distinct hex colors
          const accentColors = Array.from({ length: numPhases }, (_, i) =>
            `#${(i * 25 + 15).toString(16).padStart(2, '0')}${(i * 35 + 20).toString(16).padStart(2, '0')}${(i * 15 + 40).toString(16).padStart(2, '0')}`
          );

          const roadmap = makeRoadmap(numPhases, accentColors);
          const { container } = render(
            <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
          );

          const buttons = container.querySelectorAll('button');

          // Click the target phase button
          fireEvent.click(buttons[targetIndex]);

          // After clicking, the target button should use its accent color in the border
          const updatedButtons = container.querySelectorAll('button');
          const expectedRgb = hexToRgb(accentColors[targetIndex]);
          expect(updatedButtons[targetIndex].style.border).toContain(expectedRgb);

          // Inactive buttons should NOT use their accent color (they use the border-tertiary var)
          for (let i = 0; i < numPhases; i++) {
            if (i !== targetIndex) {
              const inactiveRgb = hexToRgb(accentColors[i]);
              expect(updatedButtons[i].style.border).not.toContain(inactiveRgb);
            }
          }

          cleanup();
        }
      ),
      { numRuns: 30 }
    );
  });
});
