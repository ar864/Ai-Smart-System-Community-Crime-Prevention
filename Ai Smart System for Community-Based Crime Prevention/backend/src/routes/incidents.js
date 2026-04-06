import { Router } from "express";
import { Incident } from "../models/Incident.js";
import { isDatabaseConnected } from "../db.js";
import {
  createMemoryIncident,
  deleteMemoryIncidentById,
  listMemoryIncidents
} from "../services/memoryIncidentStore.js";
import { requireAuth } from "../middleware/auth.js";
import { emitAlert } from "../services/alerts.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json(listMemoryIncidents());
    }

    const incidents = await Incident.find().sort({ createdAt: -1 }).limit(100);
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      const incident = createMemoryIncident(req.body);
      emitAlert({
        type: "incident",
        title: "New Incident Reported",
        message: `${incident.title} in ${incident.location?.area || "unknown area"}`,
        level: Number(incident.severity) >= 4 ? "high" : "medium",
        payload: incident
      });
      return res.status(201).json(incident);
    }

    const incident = await Incident.create(req.body);
    emitAlert({
      type: "incident",
      title: "New Incident Reported",
      message: `${incident.title} in ${incident.location?.area || "unknown area"}`,
      level: Number(incident.severity) >= 4 ? "high" : "medium",
      payload: incident
    });
    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const removed = deleteMemoryIncidentById(id);
      if (!removed) {
        return res.status(404).json({ message: "Incident not found" });
      }

      emitAlert({
        type: "incident",
        title: "Incident Deleted",
        message: `${removed.title} was deleted`,
        level: "info",
        payload: removed
      });

      return res.json({ message: "Incident deleted", incident: removed });
    }

    const deleted = await Incident.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Incident not found" });
    }

    emitAlert({
      type: "incident",
      title: "Incident Deleted",
      message: `${deleted.title} was deleted`,
      level: "info",
      payload: deleted
    });

    return res.json({ message: "Incident deleted", incident: deleted });
  } catch (error) {
    next(error);
  }
});

export default router;
