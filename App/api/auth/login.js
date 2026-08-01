import { SignJWT } from 'jose';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Timing-safe string comparison using SHA-256 hashes.
 * Prevents timing attacks by always comparing full hash digests.
 */
async function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const keyA = await crypto.subtle.digest('SHA-256', encoder.encode(a));
  const keyB = await crypto.subtle.digest('SHA-256', encoder.encode(b));
  const arrA = new Uint8Array(keyA);
  const arrB = new Uint8Array(keyB);
  if (arrA.length !== arrB.length) return false;
  let result = 0;
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i] ^ arrB[i];
  }
  return result === 0;
}

/**
 * Extracts the client IP from the request.
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * POST /api/auth/login
 * Authenticates the user with username/password.
 * Rate-limits failed attempts via Redis.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const ip = getClientIp(req);
  const rateLimitKey = `auth:failures:${ip}`;

  try {
    // Check rate limit
    const failures = await redis.get(rateLimitKey);
    const failureCount = typeof failures === 'number' ? failures : parseInt(failures || '0', 10);

    if (failureCount >= 5) {
      return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const validUsername = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;

    if (!validUsername || !validPassword || !authSecret) {
      return res.status(500).json({ error: 'Server authentication not configured' });
    }

    const usernameMatch = await timingSafeEqual(username, validUsername);
    const passwordMatch = await timingSafeEqual(password, validPassword);

    if (!usernameMatch || !passwordMatch) {
      // Increment failure count with 15-minute TTL
      const currentCount = failureCount + 1;
      await redis.set(rateLimitKey, currentCount, { ex: 900 });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Success — clear any failure count
    await redis.del(rateLimitKey);

    // Create JWT
    const encoder = new TextEncoder();
    const key = encoder.encode(authSecret);

    const token = await new SignJWT({ sub: username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key);

    // Set HTTP-only secure cookie
    const maxAge = 60 * 60 * 24; // 24 hours in seconds
    res.setHeader(
      'Set-Cookie',
      `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
