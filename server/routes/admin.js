import express from "express";
import { checkPassword, issueToken, clearToken, requireAdmin } from "../auth.js";

export const router = express.Router();

router.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Incorrect password." });
  }
  issueToken(res);
  res.json({ ok: true });
});

router.post("/admin/logout", (req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

router.get("/admin/session", requireAdmin, (req, res) => {
  res.json({ ok: true });
});
