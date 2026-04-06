import crypto from "crypto";

const memoryIncidents = [];

export function listMemoryIncidents(limit = 100) {
  return memoryIncidents.slice(0, limit);
}

export function createMemoryIncident(payload) {
  const now = new Date();
  const incident = {
    _id: `mem_${crypto.randomUUID()}`,
    title: payload.title,
    description: payload.description || "",
    category: payload.category || "other",
    location: payload.location || { area: "unknown" },
    nearestStation: payload.nearestStation || null,
    severity: Number(payload.severity || 1),
    status: payload.status || "reported",
    reportedBy: payload.reportedBy || "anonymous",
    createdAt: now,
    updatedAt: now,
    source: "memory-fallback"
  };

  memoryIncidents.unshift(incident);
  return incident;
}

export function deleteMemoryIncidentById(id) {
  const index = memoryIncidents.findIndex((item) => item._id === id);
  if (index === -1) {
    return null;
  }

  const [removed] = memoryIncidents.splice(index, 1);
  return removed;
}
