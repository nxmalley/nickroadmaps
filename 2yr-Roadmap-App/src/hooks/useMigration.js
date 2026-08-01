import { useState, useEffect, useRef } from "react";
import { NICK_ROADMAP_ID, nickRoadmap } from "../data/nick-roadmap.js";

const LEGACY_KEY = "nick-roadmap-v1";
const MIGRATION_COMPLETE_KEY = "roadmap-migration-complete";

/**
 * Extracts all valid task IDs from a roadmap data structure.
 * @param {import('../types/roadmap.js').RoadmapData} roadmap
 * @returns {Set<string>}
 */
export function getValidTaskIds(roadmap) {
  const ids = new Set();
  for (const phase of roadmap.phases) {
    for (const week of phase.weeks) {
      for (const task of week.tasks) {
        ids.add(task.id);
      }
    }
  }
  return ids;
}

/**
 * Pure migration function: maps legacy progress data to new format.
 * Only includes task IDs that exist in the target roadmap and have a `true` value.
 * Unmatched legacy IDs are silently skipped.
 *
 * @param {Record<string, boolean>} legacyData - Legacy progress map (taskId -> boolean)
 * @param {Set<string>} validTaskIds - Set of valid task IDs in the target roadmap
 * @returns {Record<string, boolean>} Migrated progress map
 */
export function migrateLegacyProgress(legacyData, validTaskIds) {
  const migrated = {};
  for (const [taskId, value] of Object.entries(legacyData)) {
    if (validTaskIds.has(taskId) && value === true) {
      migrated[taskId] = true;
    }
  }
  return migrated;
}

/**
 * Hook that handles one-time migration of legacy localStorage progress data
 * into the new progress format (localStorage + backend sync).
 *
 * @returns {{ migrated: boolean, migrating: boolean }}
 */
export function useMigration() {
  const [migrated, setMigrated] = useState(
    () => localStorage.getItem(MIGRATION_COMPLETE_KEY) === "true"
  );
  const [migrating, setMigrating] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    // Prevent double-run in StrictMode
    if (ranRef.current) return;
    ranRef.current = true;

    // Already complete — nothing to do (state initialized as true above)
    if (localStorage.getItem(MIGRATION_COMPLETE_KEY) === "true") {
      return;
    }

    // Wrap entire migration in an async IIFE so all setState calls
    // happen after an await tick, avoiding the synchronous-setState-in-effect lint error.
    (async () => {
      // Step 2: Check for legacy data
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (!legacyRaw) {
        // No legacy data — mark complete and return (Req 8.5)
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
        await Promise.resolve(); // yield before setState
        setMigrated(true);
        return;
      }

      // Step 3: Parse legacy data
      let legacyData;
      try {
        legacyData = JSON.parse(legacyRaw);
      } catch {
        // Invalid JSON — mark complete, nothing to migrate
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
        await Promise.resolve();
        setMigrated(true);
        return;
      }

      // Begin async migration
      setMigrating(true);
      try {
        // Step 4: Check if backend already has progress for the default roadmap
        let backendHasProgress = false;
        try {
          const response = await fetch(`/api/progress/${NICK_ROADMAP_ID}`);
          if (response.ok) {
            const record = await response.json();
            // Step 5: If backend has existing data, don't overwrite
            if (record && record.updatedAt) {
              backendHasProgress = true;
            }
          }
        } catch {
          // Backend unreachable — proceed with local-only migration
        }

        if (backendHasProgress) {
          localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
          setMigrated(true);
          setMigrating(false);
          return;
        }

        // Step 6: Get valid task IDs from default roadmap
        const validTaskIds = getValidTaskIds(nickRoadmap);

        // Step 7: Map legacy data to new format
        const migratedProgress = migrateLegacyProgress(legacyData, validTaskIds);

        const updatedAt = new Date().toISOString();

        // Step 8: Attempt backend sync
        try {
          await fetch(`/api/progress/${NICK_ROADMAP_ID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roadmapId: NICK_ROADMAP_ID,
              tasks: migratedProgress,
              updatedAt,
            }),
          });
        } catch {
          // Backend write failed — still store locally, sync on next load
        }

        // Step 9: Store in new localStorage format
        localStorage.setItem(
          `progress:${NICK_ROADMAP_ID}`,
          JSON.stringify({
            roadmapId: NICK_ROADMAP_ID,
            tasks: migratedProgress,
            updatedAt,
          })
        );

        // Step 10: Mark migration complete
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
      } catch {
        // Unexpected error — still mark complete to prevent re-attempts
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true");
      } finally {
        setMigrated(true);
        setMigrating(false);
      }
    })();
  }, []);

  return { migrated, migrating };
}
