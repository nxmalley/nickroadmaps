import { useState, useCallback, useMemo } from 'react';
import { useRoadmapRegistry } from '../hooks/useRoadmapRegistry.js';
import { useProgressStore } from '../hooks/useProgressStore.js';
import { useMigration } from '../hooks/useMigration.js';

/**
 * Compute metadata (total tasks + completed count) for a roadmap given a
 * progress map (taskId -> boolean). Only counts task IDs that exist in the roadmap.
 */
function computeMeta(roadmap, tasksMap) {
  let totalTasks = 0;
  let completedTasks = 0;
  for (const phase of roadmap.phases) {
    for (const week of phase.weeks) {
      for (const task of week.tasks) {
        totalTasks++;
        if (tasksMap[task.id]) completedTasks++;
      }
    }
  }
  return {
    id: roadmap.id,
    title: roadmap.title,
    subtitle: roadmap.subtitle,
    dateRange: roadmap.dateRange,
    completedTasks,
    totalTasks,
  };
}

/**
 * Read a roadmap's persisted progress map from localStorage.
 * Returns an empty object if nothing is stored or parsing fails.
 */
function readStoredTasks(roadmapId) {
  try {
    // Matches the composite key used by useProgressStore: `progress:{roadmapId}`.
    const raw = localStorage.getItem(`progress:${roadmapId}`);
    return raw ? (JSON.parse(raw).tasks || {}) : {};
  } catch {
    return {};
  }
}
import NavigationBar from './NavigationBar.jsx';
import LandingView from './LandingView.jsx';
import RoadmapView from './RoadmapView.jsx';
import CreateRoadmapForm from './CreateRoadmapForm.jsx';
import EditModeOverlay from './EditModeOverlay.jsx';

/**
 * DashboardShell — top-level container managing view routing state,
 * global layout, and coordination between child components.
 *
 * State:
 *   - activeRoadmapId (string | null): currently selected roadmap
 *   - viewMode ('landing' | 'view' | 'create' | 'edit'): which content panel to show
 *
 * Requirements: 1.1, 1.3, 1.5, 1.6
 */
export default function DashboardShell() {
  // View routing state — defaults to landing with no roadmap selected (Req 1.6)
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [viewMode, setViewMode] = useState('landing');

  // Integrate custom hooks
  const { roadmaps, addRoadmap, updateRoadmap, loading: registryLoading, error: registryError } = useRoadmapRegistry();
  const { progress, toggle } = useProgressStore(activeRoadmapId);
  const { migrating } = useMigration();

  // Derive active roadmap data from registry
  const activeRoadmap = activeRoadmapId
    ? roadmaps.find((r) => r.id === activeRoadmapId) || null
    : null;

  // Build metadata for each roadmap with live completion counts.
  // The active roadmap uses the live `progress` state (updates instantly on toggle);
  // all others read their persisted progress from localStorage.
  const meta = useMemo(() => {
    return roadmaps.map((r) => {
      const tasksMap = r.id === activeRoadmapId ? progress : readStoredTasks(r.id);
      return computeMeta(r, tasksMap);
    });
  }, [roadmaps, activeRoadmapId, progress]);

  /**
   * Handle roadmap selection from NavigationBar/Selector (Req 1.3)
   * Switches to 'view' mode and sets the active roadmap.
   */
  const handleSelectRoadmap = useCallback((id) => {
    if (id === null) {
      // Deselect — go back to landing
      setActiveRoadmapId(null);
      setViewMode('landing');
    } else {
      setActiveRoadmapId(id);
      setViewMode('view');
    }
  }, []);

  /**
   * Navigate to create roadmap form.
   */
  const handleCreateNew = useCallback(() => {
    setViewMode('create');
  }, []);

  /**
   * Handle successful roadmap creation.
   * Adds to registry and navigates to the new roadmap.
   */
  const handleRoadmapCreated = useCallback(async (newRoadmap) => {
    await addRoadmap(newRoadmap);
    setActiveRoadmapId(newRoadmap.id);
    setViewMode('view');
  }, [addRoadmap]);

  /**
   * Cancel create form — return to landing.
   */
  const handleCancelCreate = useCallback(() => {
    setViewMode(activeRoadmapId ? 'view' : 'landing');
  }, [activeRoadmapId]);

  /**
   * Enter edit mode for the currently viewed roadmap.
   */
  const handleEnterEditMode = useCallback(() => {
    setViewMode('edit');
  }, []);

  /**
   * Exit edit mode — return to view mode.
   */
  const handleExitEditMode = useCallback(() => {
    setViewMode('view');
  }, []);

  /**
   * Handle saving edits to a roadmap.
   */
  const handleSaveEdits = useCallback(async (id, data) => {
    await updateRoadmap(id, data);
    setViewMode('view');
  }, [updateRoadmap]);

  /**
   * Navigate back to landing view.
   */
  const handleGoHome = useCallback(() => {
    setActiveRoadmapId(null);
    setViewMode('landing');
  }, []);

  // Render content area based on viewMode
  function renderContent() {
    // Show loading state while registry or migration is loading
    if (registryLoading || migrating) {
      return (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading roadmaps…</p>
        </div>
      );
    }

    switch (viewMode) {
      case 'landing':
        return (
          <LandingView
            roadmaps={meta}
            onSelectRoadmap={handleSelectRoadmap}
          />
        );

      case 'view':
        if (!activeRoadmap) {
          return (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Roadmap not found.</p>
            </div>
          );
        }
        return (
          <RoadmapView
            roadmap={activeRoadmap}
            progress={progress}
            onToggleTask={toggle}
            editMode={false}
          />
        );

      case 'create':
        return (
          <CreateRoadmapForm
            onSubmit={handleRoadmapCreated}
            onCancel={handleCancelCreate}
          />
        );

      case 'edit':
        if (!activeRoadmap) {
          return (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Roadmap not found.</p>
            </div>
          );
        }
        return (
          <EditModeOverlay
            roadmap={activeRoadmap}
            onSave={(data) => handleSaveEdits(activeRoadmapId, data)}
            onDiscard={handleExitEditMode}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div style={styles.shell}>
      {/* Top-level navigation bar (Req 1.1) — title links back to the dashboard */}
      <NavigationBar
        roadmaps={meta}
        activeId={activeRoadmapId}
        onSelect={handleSelectRoadmap}
        onNavigate={handleGoHome}
      />

      {/* Error notifications — only genuine registry errors are surfaced.
          Offline/cached-data notices from the progress store are expected in
          local-only mode and are intentionally not shown. */}
      {registryError && (
        <div style={styles.errorBanner}>
          <span style={styles.errorText}>{registryError}</span>
        </div>
      )}

      {/* Content area — conditional on viewMode */}
      <main style={styles.contentArea}>
        {renderContent()}
      </main>
    </div>
  );
}

/**
 * Inline styles using CSS variable theming (Req 1.5).
 */
const styles = {
  shell: {
    minHeight: '100vh',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: '1126px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  loadingText: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
  },
  errorBanner: {
    padding: '8px 16px',
    background: 'var(--color-background-secondary)',
    borderBottom: '1px solid var(--color-border-tertiary)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  },
};
