import { Router } from "express";
import { predictRisk } from "../services/aiClient.js";
import { emitAlert } from "../services/alerts.js";

const router = Router();

function localRiskEstimate(input) {
  const areaCrimeRate = Number(input.area_crime_rate || 0);
  const nightTimeReports = Number(input.night_time_reports || 0);
  const repeatOffender = Number(input.repeat_offender_activity || 0);
  const policePresence = Number(input.police_presence_index || 0);

  let score =
    0.45 * areaCrimeRate +
    0.25 * Math.min(nightTimeReports / 10, 100) +
    0.25 * (repeatOffender * 10) -
    0.2 * (policePresence * 10);

  score = Math.max(0, Math.min(100, score));

  let level = "high";
  if (score < 35) level = "low";
  else if (score < 70) level = "medium";

  return {
    risk_score: Number(score.toFixed(2)),
    risk_level: level,
    explanation: "Estimated from local fallback model while AI service is unavailable.",
    source: "backend-fallback"
  };
}

router.post("/", async (req, res, next) => {
  try {
    const prediction = await predictRisk(req.body);
    if (prediction.risk_level === "high") {
      emitAlert({
        type: "risk",
        title: "High Risk Prediction",
        message: `AI predicted high risk score: ${prediction.risk_score}`,
        level: "high",
        payload: prediction
      });
    }
    res.json({ ...prediction, source: "ai-service" });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      const fallback = localRiskEstimate(req.body);
      if (fallback.risk_level === "high") {
        emitAlert({
          type: "risk",
          title: "High Risk Prediction",
          message: `Fallback model predicted high risk score: ${fallback.risk_score}`,
          level: "high",
          payload: fallback
        });
      }
      return res.json(fallback);
    }

    next(error);
  }
});

export default router;
