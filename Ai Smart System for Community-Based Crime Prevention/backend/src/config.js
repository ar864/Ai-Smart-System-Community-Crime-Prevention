import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crime_prevention",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  jwtSecret: process.env.JWT_SECRET || "replace-this-secret",
  adminUser: process.env.ADMIN_USER || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123"
};
