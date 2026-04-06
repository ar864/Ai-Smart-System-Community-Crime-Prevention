import app from "./app.js";
import { connectDatabase } from "./db.js";
import { config } from "./config.js";

async function connectWithRetry() {
  try {
    await connectDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error("Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectWithRetry, 10000);
  }
}

async function start() {
  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });

  await connectWithRetry();
}

start();
