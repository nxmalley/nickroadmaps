import { useSyncExternalStore, useCallback } from "react";
import DashboardShell from "./components/DashboardShell";
import LoginPage from "./components/LoginPage";

// External store for auth state to avoid setState-in-effect lint issues
let authCache = { status: "loading" }; // "loading" | "authenticated" | "unauthenticated"
let listeners = new Set();
let fetchStarted = false;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authCache;
}

function setAuth(status) {
  authCache = { status };
  listeners.forEach((l) => l());
}

function startAuthCheck() {
  if (fetchStarted) return;
  fetchStarted = true;
  fetch("/api/auth/check")
    .then((res) => res.json())
    .then((data) => {
      setAuth(data.authenticated ? "authenticated" : "unauthenticated");
    })
    .catch(() => {
      setAuth("unauthenticated");
    });
}

function App() {
  const { status } = useSyncExternalStore(subscribe, getSnapshot);

  // Trigger auth check on first render
  startAuthCheck();

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed with local logout regardless
    }
    setAuth("unauthenticated");
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuth("authenticated");
  }, []);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1724",
        color: "#94a3b8",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "14px",
      }}>
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <DashboardShell onLogout={handleLogout} />;
}

export default App;
