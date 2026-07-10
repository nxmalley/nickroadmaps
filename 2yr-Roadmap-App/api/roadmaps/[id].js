import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Vercel Serverless Function handler for /api/roadmaps/[id]
 * GET → returns a single roadmap definition
 * PUT → updates an existing roadmap definition
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Roadmap id is required' });
  }

  try {
    if (req.method === 'GET') {
      const data = await redis.get(`roadmap:${id}:definition`);

      if (!data) {
        return res.status(404).json({ error: `Roadmap '${id}' not found` });
      }

      // Upstash may return parsed object or string depending on stored format
      const roadmap = typeof data === 'string' ? JSON.parse(data) : data;
      return res.status(200).json(roadmap);
    }

    if (req.method === 'PUT') {
      const body = req.body;

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' });
      }

      // Fetch existing roadmap
      const existing = await redis.get(`roadmap:${id}:definition`);

      if (!existing) {
        return res.status(404).json({ error: `Roadmap '${id}' not found` });
      }

      const existingRoadmap = typeof existing === 'string' ? JSON.parse(existing) : existing;
      const now = new Date().toISOString();

      // Merge updates onto existing roadmap
      const updated = {
        ...existingRoadmap,
        ...body,
        id, // preserve original id
        createdAt: existingRoadmap.createdAt, // preserve original creation time
        updatedAt: now,
      };

      // Store the updated definition
      await redis.set(`roadmap:${id}:definition`, JSON.stringify(updated));

      // Update the registry entry
      const registry = (await redis.get('roadmap:registry')) || [];
      const registryList = typeof registry === 'string' ? JSON.parse(registry) : registry;
      const updatedRegistry = registryList.map((entry) =>
        entry.id === id ? updated : entry
      );
      await redis.set('roadmap:registry', JSON.stringify(updatedRegistry));

      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error(`API /api/roadmaps/${id} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
