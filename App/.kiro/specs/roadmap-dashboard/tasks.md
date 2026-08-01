# Implementation Plan: Roadmap Dashboard

## Overview

Transform the existing single-roadmap React application into a multi-roadmap dashboard with Upstash Redis backend storage, localStorage write-through caching, roadmap creation/editing, and legacy data migration — all while preserving the existing dark minimal aesthetic.

## Tasks

- [x] 1. Set up project infrastructure and data layer
  - [x] 1.1 Install dependencies and configure test framework
    - Install `@upstash/redis`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check`, and `msw`
    - Add Vitest config to `vite.config.js` with jsdom environment
    - Add `"test": "vitest --run"` script to package.json
    - Create `src/test/setup.js` for testing-library configuration
    - _Requirements: 5.4_

  - [x] 1.2 Define TypeScript-style JSDoc interfaces and data models
    - Create `src/types/roadmap.js` exporting JSDoc-annotated type definitions for `RoadmapData`, `Phase`, `Week`, `Task`, `CategoryDef`, `ProgressRecord`, `RoadmapMeta`
    - Create `src/constants/defaults.js` with default styling fallbacks (`--color-text-secondary`, `--color-background-secondary`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_

  - [x] 1.3 Create Vercel Serverless API routes for roadmaps
    - Create `api/roadmaps/index.js` handling GET (list all) and POST (create new) for roadmap definitions
    - Create `api/roadmaps/[id].js` handling GET (single) and PUT (update) for individual roadmaps
    - Integrate with Upstash Redis using `@upstash/redis` REST client
    - Use Redis keys: `roadmap:registry` (list), `roadmap:{id}:definition` (individual)
    - _Requirements: 5.1, 5.4, 6.3_

  - [x] 1.4 Create Vercel Serverless API routes for progress
    - Create `api/progress/[roadmapId].js` handling GET and PUT
    - PUT validates `updatedAt` timestamp and stores as JSON in Redis key `progress:{roadmapId}`
    - GET returns the stored ProgressRecord or empty record if none exists
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 1.5 Write unit tests for API routes
    - Test GET/POST/PUT for roadmap endpoints with mocked Redis
    - Test GET/PUT for progress endpoints with conflict resolution logic
    - Test error responses for invalid payloads
    - _Requirements: 5.1, 5.4, 5.5_

- [x] 2. Implement custom hooks (data layer)
  - [x] 2.1 Implement `useProgressStore` hook
    - Create `src/hooks/useProgressStore.js`
    - Load from localStorage immediately on mount (composite key: `progress:{roadmapId}`)
    - Fetch from backend, resolve conflicts via `updatedAt` timestamp comparison
    - On toggle: update localStorage synchronously, debounce backend sync (2s)
    - Implement exponential backoff retry (2s, 4s, 8s, 16s, 32s, max 5 retries)
    - Track `syncing`, `isOffline`, `error` states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3, 5.5, 5.6_

  - [x] 2.2 Write property test for completion state isolation (Property 4)
    - **Property 4: Completion State Isolation Between Roadmaps**
    - Verify toggling tasks in one roadmap never modifies another roadmap's state
    - **Validates: Requirements 4.1, 2.4**

  - [x] 2.3 Write property test for composite key determinism (Property 5)
    - **Property 5: Composite Key Determinism**
    - Verify storage key is deterministic for (roadmapId, taskId) and unique across distinct pairs
    - **Validates: Requirements 4.2**

  - [x] 2.4 Write property test for conflict resolution (Property 6)
    - **Property 6: Conflict Resolution — Most Recent Timestamp Wins**
    - Verify that for two progress records with different timestamps, the more recent one wins
    - **Validates: Requirements 5.5**

  - [x] 2.5 Implement `useRoadmapRegistry` hook
    - Create `src/hooks/useRoadmapRegistry.js`
    - Fetch all roadmap definitions from `/api/roadmaps` on mount
    - Provide `addRoadmap` (POST) and `updateRoadmap` (PUT) methods with optimistic local updates
    - Compute `meta` array (id, title, subtitle, dateRange, completedTasks, totalTasks) from data
    - Track `loading` and `error` states
    - _Requirements: 3.5, 3.6, 6.3_

  - [x] 2.6 Implement `useMigration` hook
    - Create `src/hooks/useMigration.js`
    - On first load, check for `nick-roadmap-v1` localStorage key
    - If found and no backend progress exists for the default roadmap, import legacy data mapping task IDs
    - Skip unmatched legacy IDs silently
    - Ensure idempotence (mark migration complete in localStorage)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 2.7 Write property test for legacy migration correctness (Property 10)
    - **Property 10: Legacy Migration Correctness**
    - Verify matching task IDs retain their boolean values, unmatched IDs are ignored
    - **Validates: Requirements 8.2, 8.3**

  - [x] 2.8 Write property test for migration idempotence (Property 11)
    - **Property 11: Migration Idempotence**
    - Verify running migration N times produces same result as running once
    - **Validates: Requirements 8.4**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build core UI components
  - [x] 4.1 Extract generic `RoadmapView` component from `Roadmap.jsx`
    - Create `src/components/RoadmapView.jsx` accepting `roadmap`, `progress`, `onToggleTask`, `editMode`, `onEditAction` props
    - Move phase navigation, week cards, and task row rendering into this component
    - Implement unknown category key fallback (default styling when cat key not in categories)
    - Apply accent color from `roadmap.accentColors[activePhaseIndex]` to phase borders and checkbox fills
    - Apply category colors from roadmap's categories object to category tags
    - _Requirements: 3.1, 3.5, 3.7, 9.1, 9.4, 9.5, 9.6_

  - [x] 4.2 Write property test for progress calculation (Property 1)
    - **Property 1: Progress Calculation Correctness**
    - Verify percentage = Math.round((completedTasks / totalTasks) * 100) for arbitrary task sets
    - **Validates: Requirements 1.2, 2.1**

  - [x] 4.3 Write property test for valid roadmap rendering (Property 2)
    - **Property 2: Valid Roadmap Data Renders Without Error**
    - Verify any schema-conforming roadmap renders without throwing and contains all task texts
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 4.4 Write property test for unknown category fallback (Property 3)
    - **Property 3: Unknown Category Key Fallback**
    - Verify tasks with unknown category keys use default secondary styling
    - **Validates: Requirements 3.7**

  - [x] 4.5 Write property test for accent color by phase index (Property 12)
    - **Property 12: Accent Color by Phase Index**
    - Verify active phase uses `accentColors[activePhaseIndex]`
    - **Validates: Requirements 9.4**

  - [x] 4.6 Write property test for category tag color mapping (Property 13)
    - **Property 13: Category Tag Color Mapping**
    - Verify category tags use the bg and color from the roadmap's categories definition
    - **Validates: Requirements 9.5**

  - [x] 4.7 Implement `DashboardShell` component
    - Create `src/components/DashboardShell.jsx`
    - Manage `activeRoadmapId` and `viewMode` ('landing' | 'view' | 'create' | 'edit') state
    - Compose `NavigationBar`, content area (conditional on viewMode), and integrate hooks
    - Use CSS variable theming for all surfaces, text, and borders
    - _Requirements: 1.1, 1.3, 1.5, 1.6_

  - [x] 4.8 Implement `NavigationBar` with `RoadmapSelector` and `GlobalProgressSummary`
    - Create `src/components/NavigationBar.jsx` with app title, selector dropdown, and global progress
    - `RoadmapSelector`: list all roadmaps with title + completion percentage, highlight active roadmap
    - `GlobalProgressSummary`: display aggregate "X/Y · Z%" across all roadmaps
    - _Requirements: 1.1, 1.2, 2.1, 2.3, 2.5, 2.6_

  - [x] 4.9 Implement `LandingView` component
    - Create `src/components/LandingView.jsx`
    - Display roadmap cards with name, date range, and per-roadmap progress percentage
    - Include "Create Roadmap" action button
    - _Requirements: 1.4, 6.1_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement roadmap creation and editing
  - [x] 6.1 Implement `CreateRoadmapForm` component
    - Create `src/components/CreateRoadmapForm.jsx`
    - Form fields: title (required, 1-100 chars), subtitle (optional, 0-200 chars), start/end dates (end >= start), categories (1-20 with label 1-30 chars and color)
    - Inline validation with error messages per field
    - On submit: call `addRoadmap`, navigate to new roadmap on success
    - On failure: show non-blocking error notification, retain form input
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.2 Write property test for form validation (Property 7)
    - **Property 7: Form Validation Completeness**
    - Verify valid inputs are accepted, invalid inputs are rejected with inline errors
    - **Validates: Requirements 6.2, 6.4**

  - [x] 6.3 Implement `EditModeOverlay` component
    - Create `src/components/EditModeOverlay.jsx`
    - Add edit mode toggle button on roadmap view
    - Support: add/remove/reorder phases, add/remove/reorder weeks, add/remove/edit tasks
    - Confirmation prompts on destructive actions (remove phase, remove week)
    - Save persists to backend via `updateRoadmap`; show error notification on failure
    - Discard reverts to last persisted state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 6.4 Write property test for edit operations integrity (Property 8)
    - **Property 8: Edit Operations Preserve Structural Integrity**
    - Verify any sequence of add/remove/reorder on valid roadmap still conforms to schema
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [x] 6.5 Write property test for discard reverts state (Property 9)
    - **Property 9: Discard Reverts to Persisted State**
    - Verify discard produces state exactly equal to last persisted state
    - **Validates: Requirements 7.6**

- [x] 7. Wire everything together and integrate
  - [x] 7.1 Update `App.jsx` to render `DashboardShell`
    - Replace current `<Roadmap />` with `<DashboardShell />`
    - Wire `useRoadmapRegistry`, `useProgressStore`, and `useMigration` hooks into the shell
    - Ensure legacy roadmap data is pre-loaded as default roadmap on first launch
    - _Requirements: 1.1, 1.6, 8.1_

  - [x] 7.2 Convert existing roadmap data to schema format
    - Create `src/data/nick-roadmap.js` exporting the current `PHASES`, `CAT`, and accent data as a `RoadmapData` object conforming to the schema
    - Ensure all task IDs match the existing IDs used in `nick-roadmap-v1` localStorage key for migration compatibility
    - _Requirements: 8.1, 8.2_

  - [x] 7.3 Add environment configuration for Upstash Redis
    - Create `.env.example` with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` placeholders
    - Add `.env` to `.gitignore`
    - Document setup steps in README or inline comments
    - _Requirements: 5.1, 5.4_

  - [x] 7.4 Write integration tests for localStorage ↔ backend sync
    - Test offline → online sync recovery flow
    - Test conflict resolution when backend and localStorage disagree
    - Test migration from legacy format on first load
    - _Requirements: 5.2, 5.3, 5.5, 5.6, 8.2_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `Roadmap.jsx` is preserved until `RoadmapView` is wired in; no breaking changes until task 7.1
- Upstash Redis credentials are configured via environment variables — never committed to source

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "7.2"] },
    { "id": 2, "tasks": ["1.5", "2.1", "2.5", "2.6", "7.3"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.7", "2.8", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9"] },
    { "id": 5, "tasks": ["6.1", "6.3"] },
    { "id": 6, "tasks": ["6.2", "6.4", "6.5"] },
    { "id": 7, "tasks": ["7.1"] },
    { "id": 8, "tasks": ["7.4"] }
  ]
}
```
