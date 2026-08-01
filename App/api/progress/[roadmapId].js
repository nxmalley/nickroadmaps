import { Redis } from '@upstash/redis';
import { verifySession } from '../_middleware/auth.js';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Vercel Serverless Function handler for /api/progress/[roadmapId]
 * GET  → returns the stored ProgressRecord or an empty record if none exists
 * PUT  → updates the progress record with conflict resolution via updatedAt timestamp
 */
export default async function handler(req, res) {
  const authenticated = await verifySession(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { roadmapId } = req.query;

  if (!roadmapId || typeof roadmapId !== 'string' || roadmapId.trim().length === 0) {
    return res.status(400).json({ error: 'roadmapId is required' });
  }

  const redisKey = `progress:${roadmapId}`;

  try {
    if (req.method === 'GET') {
      const stored = await redis.get(redisKey);

      if (!stored) {
        return res.status(200).json({
          roadmapId,
          tasks: {},
          updatedAt: null,
        });
      }

      const record = typeof stored === 'string' ? JSON.parse(stored) : stored;
      return res.status(200).json(record);
    }

    if (req.method === 'PUT') {
      const body = req.body;

      // Validate request body
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' });
      }

      if (!body.tasks || typeof body.tasks !== 'object' || Array.isArray(body.tasks)) {
        return res.status(400).json({ error: 'tasks is required and must be an object' });
      }

      if (!body.updatedAt || typeof body.updatedAt !== 'string') {
        return res.status(400).json({ error: 'updatedAt is required and must be an ISO 8601 string' });
      }

      // Conflict resolution: if stored record has a more recent updatedAt, return 409
      const stored = await redis.get(redisKey);

      if (stored) {
        const existingRecord = typeof stored === 'string' ? JSON.parse(stored) : stored;

        if (existingRecord.updatedAt && new Date(existingRecord.updatedAt) > new Date(body.updatedAt)) {
          return res.status(409).json({
            error: 'Conflict: stored record is more recent',
            stored: existingRecord,
          });
        }
      }

      // Store the progress record
      const record = {
        roadmapId,
        tasks: body.tasks,
        updatedAt: body.updatedAt,
      };

      await redis.set(redisKey, JSON.stringify(record));

      return res.status(200).json(record);
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error(`API /api/progress/${roadmapId} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
