import { verifySession } from '../_middleware/auth.js';

/**
 * GET /api/auth/check
 * Returns whether the current session is authenticated.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const authenticated = await verifySession(req);
  return res.status(200).json({ authenticated });
}
