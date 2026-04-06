import { Router } from "express";
import { emitAlert, getRecentAlerts, subscribeAlerts } from "../services/alerts.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getRecentAlerts());
});

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (alert) => {
    res.write(`event: alert\n`);
    res.write(`data: ${JSON.stringify(alert)}\n\n`);
  };

  send({
    id: "connected",
    type: "system",
    title: "Live Alerts Connected",
    message: "Real-time alert stream is active",
    level: "info",
    createdAt: new Date().toISOString()
  });

  const unsubscribe = subscribeAlerts(send);

  const keepAlive = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: ${Date.now()}\n\n`);
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
});

router.post("/test", (_req, res) => {
  const alert = emitAlert({
    type: "system",
    title: "Manual Test Alert",
    message: "This is a manually triggered alert",
    level: "medium"
  });
  res.json(alert);
});

export default router;
