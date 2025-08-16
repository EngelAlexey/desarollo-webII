import { Router } from "express";
import z from "zod";
import User from "../models/User.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

r.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if (!u || !u.verify(password)) return res.status(401).json({ error: "Credenciales inválidas" });
  if (u.locked && u.role !== "Root") return res.status(403).json({ error: "Usuario bloqueado" });
  req.session.user = { id: u._id, email: u.email, role: u.role, name: u.name };
  res.json({ ok: true, user: req.session.user });
});

r.post("/logout", requireAuth, (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

r.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

const chPwdSchema = z.object({ password: z.string().min(8) });
r.post("/root/change-password", requireAuth, validate(chPwdSchema), async (req, res) => {
  const me = await User.findById(req.session.user.id);
  if (!me || me.role !== "Root") return res.status(403).json({ error: "Solo Root" });
  me.setPassword(req.body.password);
  await me.save();  
  res.json({ ok: true });
});

export default r;
