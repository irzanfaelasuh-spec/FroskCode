const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); }
  catch { return []; }
}
function writeUsers(users) {
  const tmp = USERS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), "utf8");
  fs.renameSync(tmp, USERS_FILE);
}
function normalizeName(name) { return String(name || "").trim().normalize("NFKC"); }
function keyName(name) { return normalizeName(name).toLocaleLowerCase("en-US"); }
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}
function safeUser(user) { return { name: user.name }; }

app.post("/api/register", (req, res) => {
  const name = normalizeName(req.body.name);
  const password = String(req.body.password || "");
  if (name.length < 3 || name.length > 20 || !/^[\p{L}\p{N}_-]+$/u.test(name)) {
    return res.status(400).json({ error: "Name must be 3–20 characters: letters, numbers, _ or -." });
  }
  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const users = readUsers();
  if (users.some(u => keyName(u.name) === keyName(name))) {
    return res.status(409).json({ error: "This name is already in use, please use another one." });
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const user = { name, nameKey: keyName(name), salt, passwordHash: hashPassword(password, salt), createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);
  return res.status(201).json({ user: safeUser(user) });
});

app.post("/api/login", (req, res) => {
  const name = normalizeName(req.body.name);
  const password = String(req.body.password || "");
  const user = readUsers().find(u => u.nameKey === keyName(name));
  if (!user || !crypto.timingSafeEqual(Buffer.from(hashPassword(password, user.salt), "hex"), Buffer.from(user.passwordHash, "hex"))) {
    return res.status(401).json({ error: "Incorrect name or password." });
  }
  return res.json({ user: safeUser(user) });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "FroskCode" }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FroskCode running on http://localhost:${PORT}`);
});