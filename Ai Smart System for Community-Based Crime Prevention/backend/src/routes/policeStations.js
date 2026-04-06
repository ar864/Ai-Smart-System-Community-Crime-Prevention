import { Router } from "express";
import {
  findNearestStation,
  listPoliceStations
} from "../services/policeStations.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(listPoliceStations());
});

router.get("/nearest", (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ message: "lat and lng query params are required" });
  }

  const nearest = findNearestStation(latitude, longitude);

  if (!nearest) {
    return res.status(404).json({ message: "No police stations available" });
  }

  return res.json(nearest);
});

export default router;
