export default function RealtimeAlerts({ alerts }) {
  return (
    <section className="card">
      <h2>Real-Time Alerts</h2>
      {alerts.length === 0 ? <p>No live alerts yet.</p> : null}
      <ul className="alert-list">
        {alerts.slice(0, 12).map((alert) => (
          <li key={alert.id} className={`alert-item alert-${alert.level || "info"}`}>
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
            </div>
            <small>{new Date(alert.createdAt).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
