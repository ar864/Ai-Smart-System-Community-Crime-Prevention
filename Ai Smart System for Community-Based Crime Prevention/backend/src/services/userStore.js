import { config } from "../config.js";

const users = new Map();

users.set(config.adminUser, {
  username: config.adminUser,
  password: config.adminPassword,
  role: "admin",
  createdAt: new Date().toISOString()
});

export function findUser(username) {
  return users.get(username) || null;
}

export function createUser({ username, password }) {
  if (users.has(username)) {
    return null;
  }

  const user = {
    username,
    password,
    role: "user",
    createdAt: new Date().toISOString()
  };

  users.set(username, user);
  return { username: user.username, role: user.role, createdAt: user.createdAt };
}

export function verifyUser(username, password) {
  const user = users.get(username);
  if (!user) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return { username: user.username, role: user.role };
}
