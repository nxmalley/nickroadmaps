import { Redis } from '@upstash/redis';
import { verifySession } from './_middleware/auth.js';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const REDIS_KEY = 'financial-roadmap:data';

/**
 * GET  → returns all persisted financial roadmap data
 * PUT  → saves all financial roadmap data as a single blob
 */
export default async function handler(req, res) {
  const authenticated = await verifySession(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const stored = await redis.get(REDIS_KEY);
      return res.status(200).json(stored || null);
    }

    if (req.method === 'PUT') {
      const data = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
      }
      await redis.set(REDIS_KEY, data);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('Financial data API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
