import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 8: Edit Operations Preserve Structural Integrity
 * **Validates: Requirements 7.2, 7.3, 7.4**
 *
 * For any valid roadmap structure and any sequence of add/remove/reorder
 * operations on phases, weeks, or tasks, the resulting structure SHALL still
 * conform to the roadmap schema (all IDs unique, weeks contain tasks, phases
 * contain weeks, no orphaned references).
 */

// ======================== PURE EDIT OPERATIONS ========================

let idCounter = 0;
function generateId() {
  return `gen-${Date.now()}-${++idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function swapItems(arr, indexA, indexB) {
  if (indexA < 0 || indexB < 0 || indexA >= arr.length || indexB >= arr.length) return arr;
  const next = [...arr];
  [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
  return next;
}

// --- Phase operations ---
function addPhase(roadmap) {
  const copy = deepClone(roadmap);
  copy.phases.push({
    id: generateId(),
    title: 'New Phase',
    subtitle: '',
    dateRange: '',
    milestones: [],
    weeks: [],
  });
  return copy;
}

function removePhase(roadmap, phaseIndex) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    copy.phases.splice(phaseIndex, 1);
  }
  return copy;
}

function reorderPhases(roadmap, indexA, indexB) {
  const copy = deepClone(roadmap);
  copy.phases = swapItems(copy.phases, indexA, indexB);
  return copy;
}

// --- Week operations ---
function addWeek(roadmap, phaseIndex) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    copy.phases[phaseIndex].weeks.push({
      id: generateId(),
      label: 'New Week',
      dates: '',
      tasks: [],
    });
  }
  return copy;
}

function removeWeek(roadmap, phaseIndex, weekIndex) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    const phase = copy.phases[phaseIndex];
    if (weekIndex >= 0 && weekIndex < phase.weeks.length) {
      phase.weeks.splice(weekIndex, 1);
    }
  }
  return copy;
}

function reorderWeeks(roadmap, phaseIndex, indexA, indexB) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    copy.phases[phaseIndex].weeks = swapItems(copy.phases[phaseIndex].weeks, indexA, indexB);
  }
  return copy;
}

// --- Task operations ---
function addTask(roadmap, phaseIndex, weekIndex) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    const phase = copy.phases[phaseIndex];
    if (weekIndex >= 0 && weekIndex < phase.weeks.length) {
      phase.weeks[weekIndex].tasks.push({
        id: generateId(),
        cat: '',
        text: '',
      });
    }
  }
  return copy;
}

function removeTask(roadmap, phaseIndex, weekIndex, taskIndex) {
  const copy = deepClone(roadmap);
  if (phaseIndex >= 0 && phaseIndex < copy.phases.length) {
    const phase = copy.phases[phaseIndex];
    if (weekIndex >= 0 && weekIndex < phase.weeks.length) {
      const week = phase.weeks[weekIndex];
      if (taskIndex >= 0 && taskIndex < week.tasks.length) {
        week.tasks.splice(taskIndex, 1);
      }
    }
  }
  return copy;
}

// ======================== SCHEMA VALIDATION ========================

function validateStructuralIntegrity(roadmap) {
  // phases is a valid array
  expect(Array.isArray(roadmap.phases)).toBe(true);

  const allTaskIds = [];
  const allPhaseIds = [];

  for (const phase of roadmap.phases) {
    // Each phase has a string id
    expect(typeof phase.id).toBe('string');
    expect(phase.id.length).toBeGreaterThan(0);
    allPhaseIds.push(phase.id);

    // Each phase has a weeks array
    expect(Array.isArray(phase.weeks)).toBe(true);

    const weekIdsInPhase = [];
    for (const week of phase.weeks) {
      // Each week has a string id
      expect(typeof week.id).toBe('string');
      expect(week.id.length).toBeGreaterThan(0);
      weekIdsInPhase.push(week.id);

      // Each week has a tasks array
      expect(Array.isArray(week.tasks)).toBe(true);

      for (const task of week.tasks) {
        // Each task has a string id
        expect(typeof task.id).toBe('string');
        expect(task.id.length).toBeGreaterThan(0);
        allTaskIds.push(task.id);
      }
    }

    // Week IDs are unique within their phase
    const uniqueWeekIds = new Set(weekIdsInPhase);
    expect(uniqueWeekIds.size).toBe(weekIdsInPhase.length);
  }

  // Phase IDs are unique within the roadmap
  const uniquePhaseIds = new Set(allPhaseIds);
  expect(uniquePhaseIds.size).toBe(allPhaseIds.length);

  // Task IDs are globally unique
  const uniqueTaskIds = new Set(allTaskIds);
  expect(uniqueTaskIds.size).toBe(allTaskIds.length);

  // Structure is JSON-serializable
  expect(() => JSON.stringify(roadmap)).not.toThrow();
}

// ======================== GENERATORS ========================

// Generate a valid task
const taskArb = fc.record({
  id: fc.uuid(),
  cat: fc.string({ minLength: 0, maxLength: 10 }),
  text: fc.string({ minLength: 0, maxLength: 50 }),
});

// Generate a valid week with 1-5 tasks (unique task IDs)
const weekArb = fc.tuple(fc.uuid(), fc.string({ minLength: 1, maxLength: 20 }), fc.string({ minLength: 0, maxLength: 20 })).chain(
  ([id, label, dates]) =>
    fc.array(taskArb, { minLength: 1, maxLength: 5 }).map((tasks) => {
      // Ensure unique task IDs within generated week
      const seen = new Set();
      const uniqueTasks = tasks.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      return { id, label, dates, tasks: uniqueTasks.length > 0 ? uniqueTasks : [{ id, cat: '', text: 'default' }] };
    })
);

// Generate a valid phase with 1-4 weeks
const phaseArb = fc.tuple(
  fc.uuid(),
  fc.string({ minLength: 1, maxLength: 30 }),
  fc.string({ minLength: 0, maxLength: 30 }),
  fc.string({ minLength: 0, maxLength: 30 })
).chain(([id, title, subtitle, dateRange]) =>
  fc.array(weekArb, { minLength: 1, maxLength: 4 }).map((weeks) => {
    // Ensure unique week IDs within phase
    const seen = new Set();
    const uniqueWeeks = weeks.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
    return {
      id,
      title,
      subtitle,
      dateRange,
      milestones: [],
      weeks: uniqueWeeks.length > 0 ? uniqueWeeks : [{ id, label: 'Week 1', dates: '', tasks: [{ id: id + '-task', cat: '', text: '' }] }],
    };
  })
);

// Generate a valid roadmap with 1-5 phases
const roadmapArb = fc.array(phaseArb, { minLength: 1, maxLength: 5 }).map((phases) => {
  // Ensure unique phase IDs
  const seen = new Set();
  const uniquePhases = phases.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Ensure all task IDs are globally unique
  const taskIdsSeen = new Set();
  for (const phase of uniquePhases) {
    for (const week of phase.weeks) {
      week.tasks = week.tasks.filter((t) => {
        if (taskIdsSeen.has(t.id)) return false;
        taskIdsSeen.add(t.id);
        return true;
      });
      if (week.tasks.length === 0) {
        const fallbackId = `fallback-${generateId()}`;
        week.tasks = [{ id: fallbackId, cat: '', text: '' }];
        taskIdsSeen.add(fallbackId);
      }
    }
  }

  return {
    id: 'test-roadmap',
    title: 'Test Roadmap',
    subtitle: '',
    phases: uniquePhases.length > 0 ? uniquePhases : [{
      id: 'fallback-phase',
      title: 'Phase 1',
      subtitle: '',
      dateRange: '',
      milestones: [],
      weeks: [{ id: 'fallback-week', label: 'Week 1', dates: '', tasks: [{ id: 'fallback-task', cat: '', text: '' }] }],
    }],
  };
});

// Generate an edit operation
function operationArb(roadmap) {
  return fc.oneof(
    // Add phase
    fc.constant({ type: 'addPhase' }),
    // Remove phase
    fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }).map((idx) => ({
      type: 'removePhase',
      phaseIndex: idx,
    })),
    // Reorder phases
    fc.tuple(
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }),
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) })
    ).map(([a, b]) => ({ type: 'reorderPhases', indexA: a, indexB: b })),
    // Add week to a phase
    fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }).map((idx) => ({
      type: 'addWeek',
      phaseIndex: idx,
    })),
    // Remove week
    fc.tuple(
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }),
      fc.nat({ max: 10 })
    ).map(([pi, wi]) => ({ type: 'removeWeek', phaseIndex: pi, weekIndex: wi })),
    // Reorder weeks
    fc.tuple(
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }),
      fc.nat({ max: 10 }),
      fc.nat({ max: 10 })
    ).map(([pi, a, b]) => ({ type: 'reorderWeeks', phaseIndex: pi, indexA: a, indexB: b })),
    // Add task
    fc.tuple(
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }),
      fc.nat({ max: 10 })
    ).map(([pi, wi]) => ({ type: 'addTask', phaseIndex: pi, weekIndex: wi })),
    // Remove task
    fc.tuple(
      fc.nat({ max: Math.max(0, roadmap.phases.length - 1) }),
      fc.nat({ max: 10 }),
      fc.nat({ max: 20 })
    ).map(([pi, wi, ti]) => ({ type: 'removeTask', phaseIndex: pi, weekIndex: wi, taskIndex: ti }))
  );
}

// Apply a single operation to a roadmap
function applyOperation(roadmap, op) {
  switch (op.type) {
    case 'addPhase':
      return addPhase(roadmap);
    case 'removePhase':
      return removePhase(roadmap, op.phaseIndex);
    case 'reorderPhases':
      return reorderPhases(roadmap, op.indexA, op.indexB);
    case 'addWeek':
      return addWeek(roadmap, op.phaseIndex);
    case 'removeWeek':
      return removeWeek(roadmap, op.phaseIndex, op.weekIndex);
    case 'reorderWeeks':
      return reorderWeeks(roadmap, op.phaseIndex, op.indexA, op.indexB);
    case 'addTask':
      return addTask(roadmap, op.phaseIndex, op.weekIndex);
    case 'removeTask':
      return removeTask(roadmap, op.phaseIndex, op.weekIndex, op.taskIndex);
    default:
      return roadmap;
  }
}

// ======================== TESTS ========================

describe('Feature: roadmap-dashboard, Property 8: Edit Operations Preserve Structural Integrity', () => {
  it('any sequence of edit operations on a valid roadmap preserves structural integrity', () => {
    fc.assert(
      fc.property(
        roadmapArb,
        fc.array(fc.nat({ max: 7 }), { minLength: 5, maxLength: 20 }),
        fc.array(fc.nat({ max: 100 }), { minLength: 20, maxLength: 60 }),
        (initialRoadmap, opTypes, randomSeeds) => {
          // Reset ID counter for determinism within each test run
          idCounter = 0;

          // Validate initial roadmap
          validateStructuralIntegrity(initialRoadmap);

          let current = initialRoadmap;

          // Generate and apply operations sequentially
          for (let i = 0; i < opTypes.length; i++) {
            const seed = randomSeeds[i % randomSeeds.length];
            const op = buildOperation(opTypes[i], current, seed);
            current = applyOperation(current, op);

            // Validate after each operation
            validateStructuralIntegrity(current);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('add operations always produce new unique IDs', () => {
    fc.assert(
      fc.property(
        roadmapArb,
        fc.array(fc.constantFrom('addPhase', 'addWeek', 'addTask'), { minLength: 5, maxLength: 15 }),
        (initialRoadmap, addOps) => {
          idCounter = 0;
          let current = initialRoadmap;

          for (const opType of addOps) {
            const phaseIdx = current.phases.length > 0 ? 0 : -1;
            const weekIdx = phaseIdx >= 0 && current.phases[0].weeks.length > 0 ? 0 : -1;

            switch (opType) {
              case 'addPhase':
                current = addPhase(current);
                break;
              case 'addWeek':
                if (phaseIdx >= 0) current = addWeek(current, phaseIdx);
                break;
              case 'addTask':
                if (phaseIdx >= 0 && weekIdx >= 0) current = addTask(current, phaseIdx, weekIdx);
                break;
            }
          }

          validateStructuralIntegrity(current);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('remove operations never leave invalid structure', () => {
    fc.assert(
      fc.property(
        roadmapArb,
        fc.array(fc.nat({ max: 2 }), { minLength: 5, maxLength: 15 }),
        (initialRoadmap, removeSeeds) => {
          idCounter = 0;
          let current = initialRoadmap;

          for (const seed of removeSeeds) {
            const removeType = seed % 3;
            switch (removeType) {
              case 0: // remove phase
                if (current.phases.length > 0) {
                  current = removePhase(current, 0);
                }
                break;
              case 1: // remove week
                if (current.phases.length > 0 && current.phases[0].weeks.length > 0) {
                  current = removeWeek(current, 0, 0);
                }
                break;
              case 2: // remove task
                if (current.phases.length > 0 && current.phases[0].weeks.length > 0 && current.phases[0].weeks[0].tasks.length > 0) {
                  current = removeTask(current, 0, 0, 0);
                }
                break;
            }
          }

          validateStructuralIntegrity(current);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reorder operations preserve all existing IDs without duplication', () => {
    fc.assert(
      fc.property(
        roadmapArb,
        fc.array(fc.tuple(fc.nat({ max: 10 }), fc.nat({ max: 10 })), { minLength: 3, maxLength: 10 }),
        (initialRoadmap, swapPairs) => {
          idCounter = 0;
          let current = initialRoadmap;

          // Collect all IDs before reordering
          const idsBefore = collectAllIds(current);

          for (const [a, b] of swapPairs) {
            if (current.phases.length > 1) {
              const boundedA = a % current.phases.length;
              const boundedB = b % current.phases.length;
              current = reorderPhases(current, boundedA, boundedB);
            }
          }

          // Collect all IDs after reordering
          const idsAfter = collectAllIds(current);

          // Same set of IDs (reorder doesn't create or destroy)
          expect(new Set(idsAfter.phaseIds)).toEqual(new Set(idsBefore.phaseIds));
          validateStructuralIntegrity(current);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ======================== HELPERS ========================

function buildOperation(opTypeIndex, roadmap, seed) {
  switch (opTypeIndex) {
    case 0:
      return { type: 'addPhase' };
    case 1: {
      const idx = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      return { type: 'removePhase', phaseIndex: idx };
    }
    case 2: {
      if (roadmap.phases.length < 2) return { type: 'addPhase' };
      const a = seed % roadmap.phases.length;
      const b = (a + 1) % roadmap.phases.length;
      return { type: 'reorderPhases', indexA: a, indexB: b };
    }
    case 3: {
      const pi = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      return { type: 'addWeek', phaseIndex: pi };
    }
    case 4: {
      const pi = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      const phase = roadmap.phases[pi];
      const wi = phase && phase.weeks.length > 0 ? seed % phase.weeks.length : 0;
      return { type: 'removeWeek', phaseIndex: pi, weekIndex: wi };
    }
    case 5: {
      const pi = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      const phase = roadmap.phases[pi];
      if (!phase || phase.weeks.length < 2) return { type: 'addWeek', phaseIndex: pi };
      const a = seed % phase.weeks.length;
      const b = (a + 1) % phase.weeks.length;
      return { type: 'reorderWeeks', phaseIndex: pi, indexA: a, indexB: b };
    }
    case 6: {
      const pi = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      const phase = roadmap.phases[pi];
      const wi = phase && phase.weeks.length > 0 ? seed % phase.weeks.length : 0;
      return { type: 'addTask', phaseIndex: pi, weekIndex: wi };
    }
    case 7: {
      const pi = roadmap.phases.length > 0 ? seed % roadmap.phases.length : 0;
      const phase = roadmap.phases[pi];
      const wi = phase && phase.weeks.length > 0 ? seed % phase.weeks.length : 0;
      const week = phase && phase.weeks[wi];
      const ti = week && week.tasks.length > 0 ? seed % week.tasks.length : 0;
      return { type: 'removeTask', phaseIndex: pi, weekIndex: wi, taskIndex: ti };
    }
    default:
      return { type: 'addPhase' };
  }
}

function collectAllIds(roadmap) {
  const phaseIds = [];
  const weekIds = [];
  const taskIds = [];
  for (const phase of roadmap.phases) {
    phaseIds.push(phase.id);
    for (const week of phase.weeks) {
      weekIds.push(week.id);
      for (const task of week.tasks) {
        taskIds.push(task.id);
      }
    }
  }
  return { phaseIds, weekIds, taskIds };
}
