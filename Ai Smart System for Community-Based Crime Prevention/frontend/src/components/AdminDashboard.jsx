import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function buildCategoryData(incidents) {
  const map = incidents.reduce((acc, item) => {
    const key = item.category || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map).map(([category, count]) => ({ category, count }));
}

function buildTimelineData(incidents) {
  const map = incidents.reduce((acc, item) => {
    const day = new Date(item.createdAt).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .map(([day, reports]) => ({ day, reports }))
    .slice(-7);
}

export default function AdminDashboard({ incidents, alerts }) {
  const totalReports = incidents.length;
  const criticalReports = incidents.filter((item) => Number(item.severity) >= 4).length;
  const activeAreas = new Set(incidents.map((item) => item.location?.area || "Unknown")).size;
  const liveAlerts = alerts.length;

  const categoryData = buildCategoryData(incidents);
  const timelineData = buildTimelineData(incidents);

  return (
    <section className="card">
      <h2>Admin Dashboard</h2>
      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Total Reports</span>
          <strong>{totalReports}</strong>
        </article>
        <article className="kpi-card">
          <span>Critical Reports</span>
          <strong>{criticalReports}</strong>
        </article>
        <article className="kpi-card">
          <span>Active Areas</span>
          <strong>{activeAreas}</strong>
        </article>
        <article className="kpi-card">
          <span>Live Alerts</span>
          <strong>{liveAlerts}</strong>
        </article>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Reports by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0a9396" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Last 7-Day Report Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="reports" stroke="#bb3e03" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
