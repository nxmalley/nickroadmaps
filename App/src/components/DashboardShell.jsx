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
    const raw = localStorage.getItem(`progress:${roadmapId}`);
    return raw ? (JSON.parse(raw).tasks || {}) : {};
  } catch {
    return {};
  }
}

import NavigationBar from './NavigationBar.jsx';
import LandingView from './LandingView.jsx';
import FinancialRoadmap from './FinancialRoadmap.jsx';
import EngineeringRoadmap from './EngineeringRoadmap.jsx';

// Map roadmap IDs to their standalone components.
const ROADMAP_COMPONENTS = {
  'nick-2yr-engineering': EngineeringRoadmap,
  'financial-masterplan': FinancialRoadmap,
};

/**
 * DashboardShell — top-level container managing view routing state,
 * global layout, and coordination between child components.
 *
 * State:
 *   - activeRoadmapId (string | null): currently selected roadmap
 *   - viewMode ('landing' | 'view'): which content panel to show
 */
export default function DashboardShell({ onLogout }) {
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [viewMode, setViewMode] = useState('landing');

  // Integrate custom hooks
  const { roadmaps, loading: registryLoading, error: registryError } = useRoadmapRegistry();
  const { progress } = useProgressStore(activeRoadmapId);
  const { migrating } = useMigration();

  // Derive active roadmap data from registry
  const activeRoadmap = activeRoadmapId
    ? roadmaps.find((r) => r.id === activeRoadmapId) || null
    : null;

  // Build metadata for each roadmap with live completion counts.
  const meta = useMemo(() => {
    return roadmaps.map((r) => {
      const tasksMap = r.id === activeRoadmapId ? progress : readStoredTasks(r.id);
      return computeMeta(r, tasksMap);
    });
  }, [roadmaps, activeRoadmapId, progress]);

  /**
   * Handle roadmap selection from NavigationBar/Selector.
   */
  const handleSelectRoadmap = useCallback((id) => {
    if (id === null) {
      setActiveRoadmapId(null);
      setViewMode('landing');
    } else {
      setActiveRoadmapId(id);
      setViewMode('view');
    }
  }, []);

  /**
   * Navigate back to landing view.
   */
  const handleGoHome = useCallback(() => {
    setActiveRoadmapId(null);
    setViewMode('landing');
  }, []);

  // Render content area based on viewMode
  function renderContent() {
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

      case 'view': {
        if (!activeRoadmap) {
          return (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Roadmap not found.</p>
            </div>
          );
        }
        const CustomComponent = ROADMAP_COMPONENTS[activeRoadmapId];
        if (CustomComponent) {
          return <CustomComponent />;
        }
        // No component registered for this roadmap
        return (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>No view available for this roadmap.</p>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div style={styles.shell}>
      <NavigationBar
        roadmaps={meta}
        activeId={activeRoadmapId}
        onSelect={handleSelectRoadmap}
        onNavigate={handleGoHome}
        onLogout={onLogout}
      />

      {registryError && (
        <div style={styles.errorBanner}>
          <span style={styles.errorText}>{registryError}</span>
        </div>
      )}

      <main style={activeRoadmapId && ROADMAP_COMPONENTS[activeRoadmapId] ? { flex: 1 } : styles.contentArea}>
        {renderContent()}
      </main>
    </div>
  );
}

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
