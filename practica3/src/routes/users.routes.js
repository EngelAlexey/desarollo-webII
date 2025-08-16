import { Router } from "express";
import z from "zod";
import User, { ROLES } from "../models/User.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";

const r = Router();

/** Solo Root puede gestionar usuarios */
r.use(requireAuth, requireRole("Root"));

/** Listar usuarios (sin datos sensibles) */
r.get("/", async (_req, res) => {
  const users = await User.find({}, { email: 1, name: 1, role: 1, locked: 1 }).lean();
  res.json(users);
});

const upsertSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(ROLES),
  password: z.string().min(8)
});

/** Crear usuario */
r.post("/", validate(upsertSchema), async (req, res) => {
  const { email, name, role, password } = req.body;

  // Permitimos un único Root bloqueado (el de seed). Evitar más Roots.
  if (role === "Root") return res.status(400).json({ error: "No se pueden crear usuarios Root" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email ya existe" });

  const u = new User({ email, name, role, salt: "x", hash: "y" });
  u.setPassword(password);
  await u.save();
  res.status(201).json({ id: u._id });
});

/** Actualizar (name/role). No permite tocar Root ni convertir a Root. */
const patchSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(ROLES).optional()
});
r.patch("/:id", validate(patchSchema), async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: "No existe" });
  if (u.locked || u.role === "Root") {
    return res.status(403).json({ error: "No se puede editar el usuario Root" });
  }
  if (req.body.role === "Root") {
    return res.status(400).json({ error: "No se puede ascender a Root" });
  }
  if (req.body.name) u.name = req.body.name;
  if (req.body.role) u.role = req.body.role;
  await u.save();
  res.json({ ok: true });
});

/** Borrar. Nunca permite borrar Root. */
r.delete("/:id", async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: "No existe" });
  if (u.locked || u.role === "Root") {
    return res.status(403).json({ error: "No se puede borrar el usuario Root" });
  }
  await u.deleteOne();
  res.json({ ok: true });
});

export default r;
