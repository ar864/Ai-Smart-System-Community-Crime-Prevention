import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register" && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || `${mode} failed`);
      }

      if (mode === "register") {
        setSuccess("Registration successful. You can now login.");
        setMode("login");
        setConfirmPassword("");
      } else {
        onLogin(payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Secure Access</p>
        <h1>{mode === "login" ? "Community Safety Login" : "Create Account"}</h1>
        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "secondary-btn active-tab" : "secondary-btn"}
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "secondary-btn active-tab" : "secondary-btn"}
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </label>
        {mode === "register" ? (
          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </label>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Registering..."
            : mode === "login"
              ? "Login"
              : "Register"}
        </button>
        <p className="hint">Default admin: admin / admin123</p>
        {success ? <p className="success">{success}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </form>
    </main>
  );
}
