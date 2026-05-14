import { useState } from "react";
import { api } from "../api";

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      let data;
      if (mode === "register") {
        data = await api.register({ name, email, password });
      } else {
        data = await api.login({ email, password });
      }
      localStorage.setItem("pulsepost-token", data.token);
      onAuth(data.user);
    } catch (err) {
      setStatus(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
    setStatus("");
  }

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="auth-heading">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="auth-lead">
          {mode === "login"
            ? "Sign in to access your dashboard and publish content."
            : "Join PulsePost and start dominating every platform."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full Name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
            style={{ width: "100%", marginTop: "4px" }}
          >
            {loading
              ? "⏳ Please wait..."
              : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>

          <button
            type="button"
            className="ghost-button auth-toggle"
            onClick={toggleMode}
          >
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Sign In"}
          </button>
        </form>

        {status && <p className="status-line" style={{ color: "var(--rose)" }}>{status}</p>}
      </div>
    </div>
  );
}
