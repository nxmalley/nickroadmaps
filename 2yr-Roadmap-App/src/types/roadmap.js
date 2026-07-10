/**
 * @typedef {Object} RoadmapData
 * @property {string} id - Unique identifier, 1-100 chars, URL-safe
 * @property {string} title - Roadmap title, 1-100 characters
 * @property {string} subtitle - Roadmap subtitle, 0-200 characters
 * @property {{ start: string, end: string }} dateRange - Start and end ISO 8601 date strings (end >= start)
 * @property {string[]} accentColors - 1-10 hex color strings (e.g., ["#0F6E56", "#185FA5"])
 * @property {Record<string, CategoryDef>} categories - Category key to definition mapping
 * @property {Phase[]} phases - Array of roadmap phases
 * @property {string} createdAt - ISO 8601 datetime
 * @property {string} updatedAt - ISO 8601 datetime
 */

/**
 * @typedef {Object} CategoryDef
 * @property {string} label - Display label for the category
 * @property {string} bg - Background color (hex or CSS var reference)
 * @property {string} color - Text color (hex or CSS var reference)
 */

/**
 * @typedef {Object} Phase
 * @property {string} id - Unique identifier within the roadmap
 * @property {string} title - Phase title
 * @property {string} subtitle - Phase subtitle
 * @property {string} dateRange - Display string (e.g., "Jun 15 – Aug 2026")
 * @property {string[]} milestones - 0-20 milestone entries
 * @property {Week[]} weeks - Array of weeks in this phase
 */

/**
 * @typedef {Object} Week
 * @property {string} id - Unique identifier within the phase
 * @property {string} label - Week label
 * @property {string} dates - Display date string
 * @property {Task[]} tasks - 1-20 tasks in this week
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Globally unique identifier across all roadmaps
 * @property {string} cat - Category key referencing the roadmap's categories object
 * @property {string} text - Task description, 1-500 characters
 */

/**
 * @typedef {Object} ProgressRecord
 * @property {string} roadmapId - The roadmap this record belongs to
 * @property {Record<string, boolean>} tasks - Task ID to completion status mapping
 * @property {string} updatedAt - ISO 8601 datetime for conflict resolution
 */

/**
 * @typedef {Object} RoadmapMeta
 * @property {string} id - Roadmap identifier
 * @property {string} title - Roadmap title
 * @property {string} subtitle - Roadmap subtitle
 * @property {{ start: string, end: string }} dateRange - Start and end date range
 * @property {number} completedTasks - Number of completed tasks
 * @property {number} totalTasks - Total number of tasks
 */

export {};
