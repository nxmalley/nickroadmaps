# Requirements Document

## Introduction

The Roadmap Dashboard is a lightweight personal tool that wraps multiple roadmap components into a unified dashboard interface. It allows the user to create, view, switch between, and independently track progress on multiple roadmaps. The dashboard matches the existing dark, minimal, professional aesthetic and persists progress data across sessions via a backend storage layer suitable for Vercel deployment.

## Glossary

- **Dashboard**: The top-level application shell that provides navigation, roadmap selection, and global progress overview
- **Roadmap**: A self-contained progress tracker containing phases, weeks, tasks, and categories with independent completion state
- **Roadmap_Selector**: The UI component that displays available roadmaps and allows switching between them
- **Roadmap_Registry**: The data layer that stores metadata about all available roadmaps (name, description, creation date, accent colors)
- **Progress_Store**: The persistence layer responsible for saving and loading per-roadmap completion state across sessions
- **Phase**: A top-level grouping within a roadmap containing weeks and milestone markers
- **Task**: An individual checklist item within a week, categorized by a tag (cert, skill, read, etc.)
- **Category**: A tag applied to tasks for visual grouping (e.g., Cert, Malnax, Skill, Read, Linux)

## Requirements

### Requirement 1: Dashboard Shell

**User Story:** As a user, I want a dashboard shell that wraps my roadmap content, so that I have a consistent navigation frame and can access all roadmaps from one interface.

#### Acceptance Criteria

1. THE Dashboard SHALL render a top-level navigation bar containing the application title and a Roadmap_Selector dropdown that lists all available roadmaps by name
2. THE Dashboard SHALL display a global progress summary in the navigation bar showing the count of completed tasks out of total tasks and a percentage across all roadmaps (e.g., "42/120 · 35%")
3. WHEN the user selects a roadmap from the Roadmap_Selector, THE Dashboard SHALL render the selected roadmap content below the navigation area, replacing any previously displayed roadmap or landing view
4. WHEN no roadmap is selected, THE Dashboard SHALL display a landing view listing all available roadmaps as individual cards, each showing the roadmap name, date range, and a progress percentage calculated as completed tasks divided by total tasks for that roadmap
5. THE Dashboard SHALL use the existing CSS variable theming system (--color-background-primary, --color-background-secondary, --color-text-primary, --color-text-secondary, --color-border-tertiary, --border-radius-md, --border-radius-lg) to maintain visual consistency with the current dark minimal aesthetic
6. WHEN the application loads with no prior selection state, THE Dashboard SHALL default to the landing view with no roadmap pre-selected

### Requirement 2: Roadmap Selector

**User Story:** As a user, I want to switch between roadmaps seamlessly, so that I can track multiple independent plans without losing context.

#### Acceptance Criteria

1. THE Roadmap_Selector SHALL display all available roadmaps as a list of selectable items, where each item shows the roadmap's title and its completion percentage displayed as a whole number between 0 and 100
2. WHEN the user selects a roadmap from the Roadmap_Selector, THE Dashboard SHALL render that roadmap's phases, weeks, and tasks, and load that roadmap's separately-stored task completion state, within 1 second of selection
3. THE Roadmap_Selector SHALL visually distinguish the currently active roadmap from inactive roadmaps by applying a distinct visual style (such as a highlighted border, background change, or active-state indicator) that is visible without user interaction
4. WHEN switching between roadmaps, THE Dashboard SHALL preserve all task completion checkbox states for the previously viewed roadmap such that returning to it restores the identical set of checked and unchecked tasks
5. WHEN the application loads and no roadmap has been previously selected, THE Roadmap_Selector SHALL automatically select the first roadmap in the list and THE Dashboard SHALL render its content
6. IF only one roadmap is available, THEN THE Roadmap_Selector SHALL still be visible and display that single roadmap as the active selection

### Requirement 3: Multi-Roadmap Data Architecture

**User Story:** As a user, I want each roadmap to have its own data definition, so that I can plug in new roadmaps without modifying existing ones.

#### Acceptance Criteria

1. THE Dashboard SHALL support a roadmap data structure containing: a string identifier (unique, 1–100 characters, URL-safe), title (string, 1–100 characters), subtitle (string, 0–200 characters), date range (start date and end date as ISO 8601 date strings), an accent color array of 1–10 hex color strings, a categories object mapping category keys to objects with label (string) and color properties (background hex, text hex), and an array of phases
2. EACH Phase SHALL contain a string identifier (unique within the roadmap), title, subtitle, date range string, milestones array (0–20 string entries), and an array of weeks
3. EACH Week SHALL contain a string identifier (unique within the phase), label, dates string, and an array of 1–20 tasks
4. EACH Task SHALL contain a globally unique string identifier (unique across all roadmaps), a category key that references an entry in the roadmap's categories object, and descriptive text (1–500 characters)
5. THE Dashboard SHALL render any roadmap conforming to this data structure without requiring application code changes or redeployment
6. THE Roadmap_Registry SHALL store metadata for all roadmaps including identifier, title, description, creation date (ISO 8601), and category definitions
7. IF a roadmap definition contains a category key on a task that does not exist in the roadmap's categories object, THEN THE Dashboard SHALL render that task with default styling (--color-text-secondary text, --color-background-secondary background) rather than failing to render

### Requirement 4: Independent Progress Tracking

**User Story:** As a user, I want each roadmap's progress tracked independently, so that checking off tasks in one roadmap does not affect another.

#### Acceptance Criteria

1. THE Progress_Store SHALL maintain a separate completion record for each roadmap, keyed by a unique roadmap identifier, such that toggling a task in one roadmap does not modify the completion record of any other roadmap
2. WHEN the user toggles a task's completion status, THE Progress_Store SHALL persist the change to browser local storage within 1 second, using the roadmap identifier and task identifier as the composite key
3. WHEN the user navigates to a roadmap, THE Progress_Store SHALL load that roadmap's completion state from browser local storage and reflect it in the UI within 500 milliseconds
4. IF the Progress_Store fails to save a change, THEN THE Dashboard SHALL display a non-blocking error notification that auto-dismisses after 5 seconds and SHALL retain the unsaved change in application memory until the next successful save attempt
5. IF the user navigates to a roadmap that has no previously stored completion record, THEN THE Progress_Store SHALL initialize all tasks in that roadmap as incomplete

### Requirement 5: Persistent Storage Across Sessions

**User Story:** As a user, I want my progress to survive across browser sessions and devices, so that I can access my roadmaps from anywhere after deploying to Vercel.

#### Acceptance Criteria

1. THE Progress_Store SHALL persist roadmap completion data to a backend storage mechanism that survives browser clears and device switches
2. THE Progress_Store SHALL use localStorage as a read cache that returns data without a network round-trip, and SHALL sync completion state to the backend storage within 2 seconds of each write operation
3. WHEN the application loads, THE Progress_Store SHALL attempt to load data from the backend storage within 5 seconds; IF the backend does not respond within 5 seconds or returns an error, THEN THE Progress_Store SHALL load data from localStorage and display a non-blocking indicator that the app is operating from cached data
4. THE Progress_Store SHALL support Vercel-compatible storage (Vercel KV, Vercel Postgres, or a serverless-friendly alternative)
5. IF the backend storage and localStorage contain conflicting completion states for the same roadmap, THEN THE Progress_Store SHALL treat the record with the most recent timestamp as authoritative and overwrite the stale copy
6. IF a backend write fails, THEN THE Progress_Store SHALL retain the change in localStorage and retry the sync on the next successful backend connection, ensuring no completion data is lost

### Requirement 6: Roadmap Creation

**User Story:** As a user, I want to create new roadmaps, so that I can add plans for different goals without needing to edit source code.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a "Create Roadmap" action accessible from the landing view
2. WHEN the user initiates roadmap creation, THE Dashboard SHALL present a form collecting: title (required, 1–100 characters), subtitle (optional, 0–200 characters), start date and end date (required, end date must be equal to or later than start date), and between 1 and 20 category definitions each consisting of a label (1–30 characters) and a display color
3. WHEN the user submits a valid roadmap creation form, THE Roadmap_Registry SHALL store the new roadmap and THE Dashboard SHALL navigate to the newly created roadmap's view
4. IF the user submits the roadmap creation form with missing required fields or invalid values, THEN THE Dashboard SHALL display inline validation messages identifying each invalid field and SHALL NOT submit the form to the Roadmap_Registry
5. IF the Roadmap_Registry fails to store the new roadmap, THEN THE Dashboard SHALL display a non-blocking error notification indicating the save failure and SHALL retain the user's form input
6. THE Dashboard SHALL allow the user to add phases, weeks, and tasks to a newly created roadmap through the editing interface defined in Requirement 7

### Requirement 7: Roadmap Editing

**User Story:** As a user, I want to update existing roadmaps by adding, removing, or modifying phases, weeks, and tasks, so that my plans evolve as my goals change.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an edit mode toggle button visible on the currently viewed roadmap that switches between view mode (progress tracking) and edit mode (structural editing)
2. WHILE in edit mode, THE Dashboard SHALL allow adding a new phase (with title, subtitle, date range, milestones), removing an existing phase (with confirmation prompt), and reordering phases via drag-and-drop or up/down controls
3. WHILE in edit mode, THE Dashboard SHALL allow adding a new week (with label and dates) to any phase, removing an existing week (with confirmation prompt), and reordering weeks within a phase
4. WHILE in edit mode, THE Dashboard SHALL allow adding a new task (with category key and text), removing an existing task, and editing a task's category key and descriptive text inline
5. WHEN the user saves edits, THE Roadmap_Registry SHALL persist all structural changes to the backend storage; IF the save fails, THEN THE Dashboard SHALL display a non-blocking error notification and retain the unsaved edits in application memory
6. IF the user discards edits (via a cancel/discard button), THEN THE Dashboard SHALL revert all unsaved structural changes to the last persisted state without modifying the backend storage

### Requirement 8: Import Existing Roadmap Data

**User Story:** As a user, I want to import existing roadmap data (like the current Roadmap.jsx content and the nick_roadmap.html v3 data), so that my current progress is preserved in the new dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL ship with the nick_roadmap.html v3 roadmap data pre-loaded as the default roadmap on first launch, replacing the current Roadmap.jsx content
2. WHEN the application detects a localStorage key "nick-roadmap-v1" on first load and no backend progress record exists for the default roadmap, THE Progress_Store SHALL import that data into the new progress format using the roadmap identifier and the matching task identifiers
3. WHEN migrating legacy progress data, THE Progress_Store SHALL map each legacy task identifier to the corresponding task identifier in the v3 roadmap; IF a legacy identifier has no match in the v3 roadmap (e.g., a removed task), THEN THE Progress_Store SHALL skip that entry without error
4. THE migration process SHALL be idempotent: running the import logic multiple times SHALL produce the same result and SHALL NOT duplicate or overwrite progress data that was modified after the initial migration
5. IF no localStorage key "nick-roadmap-v1" is found on first load, THEN THE Progress_Store SHALL initialize the default roadmap with all tasks marked as incomplete

### Requirement 9: Visual Consistency

**User Story:** As a user, I want the dashboard to match the existing roadmap's dark, minimal, professional aesthetic, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Dashboard SHALL use the color palette defined in index.css, including background tokens (--color-background-primary, --color-background-secondary), text tokens (--color-text-primary, --color-text-secondary, --color-text-tertiary), and border tokens (--color-border-tertiary, --color-border-secondary) for all rendered surfaces, text elements, and borders respectively
2. THE Dashboard SHALL use the existing font stack (system-ui, -apple-system, sans-serif) defined via the --font-sans token for all text elements
3. THE Dashboard SHALL use the existing border radius tokens (--border-radius-md: 6px for inline elements and controls, --border-radius-lg: 10px for container panels and cards)
4. WHEN a roadmap defines an accent color array, THE Dashboard SHALL apply the accent color corresponding to the active phase index to phase indicator borders and completed-task checkbox fills
5. WHEN rendering category tags, THE Dashboard SHALL display each tag using the background and text color defined in that roadmap's category color map (e.g., the CAT object's bg and color properties)
6. IF a roadmap does not define an accent color or a category color for a given entry, THEN THE Dashboard SHALL fall back to --color-text-secondary for text and --color-border-tertiary for borders
