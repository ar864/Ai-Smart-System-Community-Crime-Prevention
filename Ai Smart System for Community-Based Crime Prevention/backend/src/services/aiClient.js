import axios from "axios";
import { config } from "../config.js";

export async function predictRisk(input) {
  const response = await axios.post(`${config.aiServiceUrl}/predict`, input, {
    timeout: 5000
  });

  return response.data;
}
