import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  category: "other",
  area: "",
  severity: 1,
  reportedBy: "",
  latitude: "",
  longitude: ""
};

export default function IncidentForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nearestStation, setNearestStation] = useState(null);
  const [locating, setLocating] = useState(false);

  async function fetchNearestStation(latitude, longitude) {
    const response = await fetch(
      `/api/police-stations/nearest?lat=${latitude}&lng=${longitude}`
    );

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Failed to fetch nearest police station");
    }

    const station = await response.json();
    setNearestStation(station);
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude).toFixed(6);
        const longitude = Number(position.coords.longitude).toFixed(6);

        setForm((prev) => ({ ...prev, latitude, longitude }));

        try {
          await fetchNearestStation(latitude, longitude);
        } catch (err) {
          setError(err.message);
        } finally {
          setLocating(false);
        }
      },
      (geoError) => {
        setLocating(false);
        setError(geoError.message || "Unable to get location");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          location: {
            area: form.area,
            latitude: form.latitude ? Number(form.latitude) : undefined,
            longitude: form.longitude ? Number(form.longitude) : undefined
          },
          severity: Number(form.severity),
          reportedBy: form.reportedBy || "anonymous",
          nearestStation: nearestStation
            ? {
                id: nearestStation.id,
                name: nearestStation.name,
                address: nearestStation.address,
                phone: nearestStation.phone,
                distanceKm: nearestStation.distanceKm
              }
            : undefined
        })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || "Failed to report incident");
      }

      const created = await response.json();
      onCreated(created);
      setForm(initialForm);
      setNearestStation(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Report Incident</h2>
      <input
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Incident title"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        rows={3}
      />
      <input
        required
        value={form.area}
        onChange={(e) => setForm({ ...form, area: e.target.value })}
        placeholder="Area / Neighborhood"
      />
      <div className="split">
        <input
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
          placeholder="Latitude"
        />
        <input
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
          placeholder="Longitude"
        />
      </div>
      <button
        type="button"
        className="secondary-btn"
        onClick={captureLocation}
        disabled={locating}
      >
        {locating ? "Getting Location..." : "Use My Location"}
      </button>
      {nearestStation ? (
        <p className="hint">
          Nearest: {nearestStation.name} ({nearestStation.distanceKm} km)
        </p>
      ) : null}
      <div className="split">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="theft">Theft</option>
          <option value="assault">Assault</option>
          <option value="vandalism">Vandalism</option>
          <option value="fraud">Fraud</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          min={1}
          max={5}
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          placeholder="Severity 1-5"
        />
      </div>
      <input
        value={form.reportedBy}
        onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
        placeholder="Reported by (optional)"
      />
      <button disabled={loading} type="submit">
        {loading ? "Saving..." : "Submit Report"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
