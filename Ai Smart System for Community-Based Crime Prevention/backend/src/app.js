import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import incidentsRouter from "./routes/incidents.js";
import predictRouter from "./routes/predict.js";
import authRouter from "./routes/auth.js";
import policeStationsRouter from "./routes/policeStations.js";
import alertsRouter from "./routes/alerts.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
}

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/predict-risk", predictRouter);
app.use("/api/police-stations", policeStationsRouter);
app.use("/api/alerts", alertsRouter);

if (process.env.NODE_ENV === "production") {
  app.get("/*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

app.use((err, _req, res, _next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    details: err.response?.data || null
  });
});

export default app;
