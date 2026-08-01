import { useState } from "react";

/**
 * LoginPage — Full-screen login UI with dark theme matching the app design.
 * @param {object} props
 * @param {() => void} props.onLoginSuccess
 */
export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        onLoginSuccess();
      } else if (res.status === 429) {
        setError(data.error || "Too many attempts. Try again later.");
      } else if (res.status === 401) {
        setError(data.error || "Invalid credentials");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error. Please check your network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M8 40V12L18 28L24 16L30 28L40 12V40" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <defs>
              <linearGradient id="logoGrad" x1="8" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.subtext}>Sign in to access your personal dashboard</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username field */}
          <div style={styles.fieldWrapper}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          {/* Password field */}
          <div style={styles.fieldWrapper}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M12 7H4V5a4 4 0 118 0v2zm1 0V5a5 5 0 10-10 0v2a1 1 0 00-1 1v5a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1z"/>
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loading}
              style={{ ...styles.input, paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 3C4.5 3 1.7 5.1 0.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5c-1.2-2.9-4-5-7.5-5zm0 8a3 3 0 110-6 3 3 0 010 6zm0-5a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M2.1 1.4L1.4 2.1l2.8 2.8C2.7 6 1.4 7 .5 8c1.2 2.9 4 5 7.5 5 1.3 0 2.5-.3 3.5-.8l2.4 2.4.7-.7-12.5-12.5zM8 11a3 3 0 01-2.6-4.5l1 1a2 2 0 002.1 2.1l1 1A3 3 0 018 11zm5.1-1.5L11.7 8l.8-.3c.3-.5.5-1 .5-1.7 0-.2 0-.3-.1-.5A8.3 8.3 0 0015.5 8c-.6 1.4-1.6 2.5-2.4 3.5V9.5zM8 5c.2 0 .3 0 .5.1l-3.6-3.6C5.9 3.2 7 3 8 3c3.5 0 6.3 2.1 7.5 5-.5 1.2-1.3 2.3-2.2 3.1l-1.4-1.4A3 3 0 008 5z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && <p style={styles.error}>{error}</p>}

          {/* Forgot password link */}
          <div style={styles.forgotRow}>
            <span style={styles.forgotLink}>Forgot my password?</span>
          </div>

          {/* Submit button */}
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Security note */}
        <div style={styles.securityNote}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#6366f1" aria-hidden="true">
            <path d="M12 7H4V5a4 4 0 118 0v2zm1 0V5a5 5 0 10-10 0v2a1 1 0 00-1 1v5a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1z"/>
          </svg>
          <span>Secure and private. Only you have access.</span>
        </div>

        {/* Footer */}
        <p style={styles.footer}>© 2026 Malnax. All rights reserved.</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f1724 0%, #1a2332 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#1e293b",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: "24px",
  },
  heading: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: 500,
    color: "#ffffff",
  },
  subtext: {
    margin: "0 0 28px 0",
    fontSize: "14px",
    color: "#94a3b8",
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  fieldIcon: {
    position: "absolute",
    left: "12px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  error: {
    margin: "0",
    fontSize: "13px",
    color: "#ef4444",
    textAlign: "left",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#6366f1",
    cursor: "pointer",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
    marginTop: "4px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: "12px",
    color: "#64748b",
  },
  securityNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  footer: {
    margin: 0,
    fontSize: "12px",
    color: "#475569",
    textAlign: "center",
  },
};
