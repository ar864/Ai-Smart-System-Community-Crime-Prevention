import { useState } from "react";

const initialInput = {
  area_crime_rate: 35,
  night_time_reports: 40,
  repeat_offender_activity: 4,
  police_presence_index: 5
};

export default function RiskPanel() {
  const [input, setInput] = useState(initialInput);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getPrediction(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          area_crime_rate: Number(input.area_crime_rate),
          night_time_reports: Number(input.night_time_reports),
          repeat_offender_activity: Number(input.repeat_offender_activity),
          police_presence_index: Number(input.police_presence_index)
        })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || "Unable to fetch risk prediction");
      }

      setResult(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={getPrediction}>
      <h2>AI Risk Estimator</h2>
      <label>
        Area Crime Rate (0-100)
        <input
          type="number"
          min={0}
          max={100}
          value={input.area_crime_rate}
          onChange={(e) => setInput({ ...input, area_crime_rate: e.target.value })}
        />
      </label>
      <label>
        Night-Time Reports
        <input
          type="number"
          min={0}
          value={input.night_time_reports}
          onChange={(e) => setInput({ ...input, night_time_reports: e.target.value })}
        />
      </label>
      <label>
        Repeat Offender Activity (0-10)
        <input
          type="number"
          min={0}
          max={10}
          value={input.repeat_offender_activity}
          onChange={(e) =>
            setInput({ ...input, repeat_offender_activity: e.target.value })
          }
        />
      </label>
      <label>
        Police Presence Index (0-10)
        <input
          type="number"
          min={0}
          max={10}
          value={input.police_presence_index}
          onChange={(e) =>
            setInput({ ...input, police_presence_index: e.target.value })
          }
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? "Predicting..." : "Predict Risk"}
      </button>
      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <div className="result">
          <p>
            Score: <strong>{result.risk_score}</strong>
          </p>
          <p>
            Level: <strong className={`level-${result.risk_level}`}>{result.risk_level}</strong>
          </p>
          <p>{result.explanation}</p>
        </div>
      ) : null}
    </form>
  );
}
