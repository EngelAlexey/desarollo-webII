import { Router } from "express";
import multer from "multer";
import z from "zod";
import Category from "../models/Category.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";
import { validate } from "../middlewares/validate.js";

const r = Router();
const upload = multer({ limits: { fileSize: 800 * 1024 } }); // 800 KB

const idParam = z.object({ id: z.string().min(1) });
const upsertSchema = z.object({
  CategoryID:   z.string().min(1),
  CategoryName: z.string().min(1),
  Description:  z.string().optional()
});

// LISTAR (público)
r.get("/", async (_req, res) => {
  const items = await Category.find({}, "-Image -Mime").lean();
  res.json(items);
});

// OBTENER por id
r.get("/:id", validate(idParam, "params"), async (req, res) => {
  const item = await Category.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: "No existe" });
  res.json(item);
});

// IMAGEN
r.get("/:id/image", validate(idParam, "params"), async (req, res) => {
  const item = await Category.findById(req.params.id);
  if (!item?.Image) return res.status(404).end();
  res.setHeader("Content-Type", item.Mime || "application/octet-stream");
  res.send(item.Image);
});

// CREAR (Admin/Root)
r.post(
  "/",
  requireAuth,
  requireRole("Admin", "Root"),
  upload.single("image"),
  validate(upsertSchema),
  async (req, res) => {
    const { CategoryID, CategoryName, Description = "" } = req.body;
    const c = new Category({ CategoryID, CategoryName, Description });
    if (req.file) { c.Image = req.file.buffer; c.Mime = req.file.mimetype; }
    await c.save();
    res.status(201).json({ id: c._id });
  }
);

// ACTUALIZAR (Admin/Root)
r.put(
  "/:id",
  requireAuth,
  requireRole("Admin", "Root"),
  validate(idParam, "params"),
  upload.single("image"),
  validate(upsertSchema),
  async (req, res) => {
    const c = await Category.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "No existe" });
    Object.assign(c, req.body);
    if (req.file) { c.Image = req.file.buffer; c.Mime = req.file.mimetype; }
    await c.save();
    res.json({ ok: true });
  }
);

// BORRAR (Root)
r.delete(
  "/:id",
  requireAuth,
  requireRole("Root"),
  validate(idParam, "params"),
  async (req, res) => {
    const c = await Category.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "No existe" });
    await c.deleteOne();
    res.json({ ok: true });
  }
);

export default r;
