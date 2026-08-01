/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Clear the session cookie by setting it to empty with immediate expiry
  res.setHeader(
    'Set-Cookie',
    'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );

  return res.status(200).json({ ok: true });
}
