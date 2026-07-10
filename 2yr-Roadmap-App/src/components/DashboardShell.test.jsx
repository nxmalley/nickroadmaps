import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardShell from './DashboardShell.jsx';

// Mock hooks
vi.mock('../hooks/useRoadmapRegistry.js', () => ({
  useRoadmapRegistry: vi.fn(),
}));
vi.mock('../hooks/useProgressStore.js', () => ({
  useProgressStore: vi.fn(),
}));
vi.mock('../hooks/useMigration.js', () => ({
  useMigration: vi.fn(),
}));

import { useRoadmapRegistry } from '../hooks/useRoadmapRegistry.js';
import { useProgressStore } from '../hooks/useProgressStore.js';
import { useMigration } from '../hooks/useMigration.js';

const mockRoadmap = {
  id: 'test-roadmap',
  title: 'Test Roadmap',
  subtitle: 'A test roadmap',
  dateRange: { start: '2025-01-01', end: '2026-12-31' },
  accentColors: ['#0F6E56'],
  categories: { cert: { label: 'Cert', bg: '#1a3a2a', color: '#4ade80' } },
  phases: [{
    id: 'phase-1',
    title: 'Phase 1',
    subtitle: 'First phase',
    dateRange: 'Jan – Jun 2025',
    milestones: ['Milestone 1'],
    weeks: [{
      id: 'week-1',
      label: 'Week 1',
      dates: 'Jan 1-7',
      tasks: [{ id: 'task-1', cat: 'cert', text: 'Complete certification' }],
    }],
  }],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockMeta = [{
  id: 'test-roadmap',
  title: 'Test Roadmap',
  subtitle: 'A test roadmap',
  dateRange: { start: '2025-01-01', end: '2026-12-31' },
  completedTasks: 0,
  totalTasks: 1,
}];

function setupMocks({ loading = false, migrating = false, roadmaps = [mockRoadmap], meta = mockMeta } = {}) {
  useRoadmapRegistry.mockReturnValue({
    roadmaps,
    meta,
    addRoadmap: vi.fn(),
    updateRoadmap: vi.fn(),
    loading,
    error: null,
  });

  useProgressStore.mockReturnValue({
    progress: {},
    toggle: vi.fn(),
    loading: false,
    syncing: false,
    error: null,
    isOffline: false,
  });

  useMigration.mockReturnValue({
    migrated: !migrating,
    migrating,
  });
}

describe('DashboardShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state while registry is loading', () => {
    setupMocks({ loading: true });
    render(<DashboardShell />);
    expect(screen.getByText('Loading roadmaps…')).toBeInTheDocument();
  });

  it('renders loading state while migration is in progress', () => {
    setupMocks({ migrating: true });
    render(<DashboardShell />);
    expect(screen.getByText('Loading roadmaps…')).toBeInTheDocument();
  });

  it('defaults to landing view when loaded with no prior selection (Req 1.6)', () => {
    setupMocks();
    render(<DashboardShell />);
    // The LandingView placeholder renders "Your Roadmaps"
    expect(screen.getByText('Your Roadmaps')).toBeInTheDocument();
  });

  it('renders NavigationBar with app title (Req 1.1)', () => {
    setupMocks();
    render(<DashboardShell />);
    expect(screen.getByText('Roadmap Dashboard')).toBeInTheDocument();
  });

  it('uses CSS variable theming for shell background (Req 1.5)', () => {
    setupMocks();
    const { container } = render(<DashboardShell />);
    const shell = container.firstChild;
    expect(shell.style.background).toBe('var(--color-background-primary)');
    expect(shell.style.fontFamily).toBe('var(--font-sans)');
  });

  it('passes null to useProgressStore when no roadmap is selected', () => {
    setupMocks();
    render(<DashboardShell />);
    expect(useProgressStore).toHaveBeenCalledWith(null);
  });

  it('displays error banner when registry has an error', () => {
    useRoadmapRegistry.mockReturnValue({
      roadmaps: [mockRoadmap],
      meta: mockMeta,
      addRoadmap: vi.fn(),
      updateRoadmap: vi.fn(),
      loading: false,
      error: 'Failed to load roadmaps',
    });
    useProgressStore.mockReturnValue({
      progress: {},
      toggle: vi.fn(),
      loading: false,
      syncing: false,
      error: null,
      isOffline: false,
    });
    useMigration.mockReturnValue({ migrated: true, migrating: false });

    render(<DashboardShell />);
    expect(screen.getByText('Failed to load roadmaps')).toBeInTheDocument();
  });
});
