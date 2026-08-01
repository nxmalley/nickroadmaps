import { jwtVerify } from 'jose';

/**
 * Parses cookies from the request's Cookie header.
 * @param {import('http').IncomingMessage} req
 * @returns {Record<string, string>}
 */
function parseCookies(req) {
  const header = req.headers.cookie || '';
  const cookies = {};
  header.split(';').forEach((pair) => {
    const [key, ...rest] = pair.split('=');
    if (key) {
      cookies[key.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

/**
 * Verifies the session JWT from the request's cookie.
 * Returns true if the session is valid, false otherwise.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<boolean>}
 */
export async function verifySession(req) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return false;

    const cookies = parseCookies(req);
    const token = cookies.session;
    if (!token) return false;

    const encoder = new TextEncoder();
    const key = encoder.encode(secret);

    await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return true;
  } catch {
    return false;
  }
}
