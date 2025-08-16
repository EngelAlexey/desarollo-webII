export const validate = (schema, where = "body") => (req, res, next) => {
  const parsed = schema.safeParse(req[where]);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validación", details: parsed.error.flatten() });
  }
  req[where] = parsed.data;
  next();
};
