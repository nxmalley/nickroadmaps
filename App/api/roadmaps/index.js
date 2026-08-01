import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Generates a URL-safe slug from a title string.
 * @param {string} title
 * @returns {string}
 */
function generateId(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Vercel Serverless Function handler for /api/roadmaps
 * GET  → returns all roadmap definitions from the registry
 * POST → creates a new roadmap definition
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const registry = await redis.get('roadmap:registry');
      const roadmaps = registry || [];
      return res.status(200).json(roadmaps);
    }

    if (req.method === 'POST') {
      const body = req.body;

      if (!body || !body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
        return res.status(400).json({ error: 'title is required and must be a non-empty string' });
      }

      if (body.title.length > 100) {
        return res.status(400).json({ error: 'title must be 100 characters or fewer' });
      }

      const id = body.id || generateId(body.title);
      const now = new Date().toISOString();

      const roadmap = {
        id,
        title: body.title.trim(),
        subtitle: body.subtitle || '',
        dateRange: body.dateRange || { start: '', end: '' },
        accentColors: body.accentColors || [],
        categories: body.categories || {},
        phases: body.phases || [],
        createdAt: now,
        updatedAt: now,
      };

      // Store the individual definition
      await redis.set(`roadmap:${id}:definition`, JSON.stringify(roadmap));

      // Update the registry
      const registry = (await redis.get('roadmap:registry')) || [];
      registry.push(roadmap);
      await redis.set('roadmap:registry', JSON.stringify(registry));

      return res.status(201).json(roadmap);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API /api/roadmaps error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
