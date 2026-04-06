import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { createUser, findUser, verifyUser } from "../services/userStore.js";

const router = Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (findUser(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const created = createUser({ username, password });
  return res.status(201).json({ message: "User registered", user: created });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  const user = verifyUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, config.jwtSecret, {
    expiresIn: "8h"
  });

  return res.json({ token, user });
});

export default router;
