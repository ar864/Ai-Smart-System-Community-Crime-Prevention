import { useEffect, useState } from "react";
import IncidentForm from "./components/IncidentForm.jsx";
import RiskPanel from "./components/RiskPanel.jsx";
import LoginPage from "./components/LoginPage.jsx";
import CrimeHeatmap from "./components/CrimeHeatmap.jsx";
import RealtimeAlerts from "./components/RealtimeAlerts.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    let stream;

    async function loadRecentAlerts() {
      try {
        const response = await fetch("/api/alerts");
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : []);
      } catch {
        setAlerts([]);
      }
    }

    loadRecentAlerts();

    try {
      stream = new EventSource("/api/alerts/stream");
      stream.addEventListener("alert", (event) => {
        const incoming = JSON.parse(event.data);
        setAlerts((prev) => [incoming, ...prev].slice(0, 30));
      });
    } catch {
      // Event stream fallback is recent-alert polling above.
    }

    return () => stream?.close();
  }, []);

  async function loadIncidents() {
    try {
      const response = await fetch("/api/incidents");
      const data = await response.json();
      setIncidents(data);
    } finally {
      setLoading(false);
    }
  }

  function handleCreated(incident) {
    setIncidents((prev) => [incident, ...prev]);
  }

  function handleLogin(payload) {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("auth_token", payload.token);
    localStorage.setItem("auth_user", JSON.stringify(payload.user));
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  async function handleDelete(incidentId) {
    if (!token) {
      return;
    }

    const ok = window.confirm("Delete this incident report?");
    if (!ok) {
      return;
    }

    const response = await fetch(`/api/incidents/${incidentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
      }
      window.alert(payload.message || "Failed to delete incident");
      return;
    }

    setIncidents((prev) => prev.filter((item) => item._id !== incidentId));
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Community Safety Dashboard</p>
        <h1>AI Smart System for Crime Prevention</h1>
        <p>
          Capture neighborhood incidents, estimate localized risk, and support
          coordinated prevention actions.
        </p>
        <div className="hero-meta">
          <span>Logged in as {user?.username || "admin"}</span>
          <button className="secondary-btn" onClick={handleLogout}>Logout</button>
        </div>
      </section>

      <section className="grid">
        <IncidentForm onCreated={handleCreated} />
        <RiskPanel />
      </section>

      <section className="grid">
        <CrimeHeatmap incidents={incidents} />
        <RealtimeAlerts alerts={alerts} />
      </section>

      <AdminDashboard incidents={incidents} alerts={alerts} />

      <section className="card">
        <h2>Recent Incident Reports</h2>
        {loading ? <p>Loading incidents...</p> : null}
        {!loading && incidents.length === 0 ? (
          <p>No incidents yet. Submit the first report.</p>
        ) : null}
        <ul className="incident-list">
          {incidents.map((item) => (
            <li key={item._id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description || "No description"}</p>
                <span>
                  {item.category} | {item.location?.area} | severity {item.severity}
                </span>
                {item.location?.latitude && item.location?.longitude ? (
                  <p>
                    Location: {Number(item.location.latitude).toFixed(5)}, {" "}
                    {Number(item.location.longitude).toFixed(5)}
                  </p>
                ) : null}
                {item.nearestStation?.name ? (
                  <p>
                    Nearest station: {item.nearestStation.name} ({item.nearestStation.distanceKm} km)
                  </p>
                ) : null}
              </div>
              <div className="item-actions">
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(item._id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
