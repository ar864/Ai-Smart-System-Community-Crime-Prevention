import crypto from "crypto";

const subscribers = new Set();
const recentAlerts = [];

export function getRecentAlerts(limit = 50) {
  return recentAlerts.slice(0, limit);
}

export function subscribeAlerts(handler) {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export function emitAlert({
  type = "system",
  title = "System Alert",
  message,
  level = "info",
  payload = null
}) {
  const alert = {
    id: `alert_${crypto.randomUUID()}`,
    type,
    title,
    message,
    level,
    payload,
    createdAt: new Date().toISOString()
  };

  recentAlerts.unshift(alert);
  if (recentAlerts.length > 200) {
    recentAlerts.pop();
  }

  subscribers.forEach((handler) => {
    handler(alert);
  });

  return alert;
}
