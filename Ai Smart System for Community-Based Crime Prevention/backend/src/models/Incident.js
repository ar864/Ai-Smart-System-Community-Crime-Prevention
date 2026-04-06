import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["theft", "assault", "vandalism", "fraud", "other"],
      default: "other"
    },
    location: {
      area: { type: String, required: true, trim: true },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    nearestStation: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      phone: { type: String, trim: true },
      distanceKm: { type: Number }
    },
    severity: { type: Number, min: 1, max: 5, default: 1 },
    status: {
      type: String,
      enum: ["reported", "in_review", "resolved"],
      default: "reported"
    },
    reportedBy: { type: String, trim: true, default: "anonymous" }
  },
  { timestamps: true }
);

export const Incident = mongoose.model("Incident", incidentSchema);
