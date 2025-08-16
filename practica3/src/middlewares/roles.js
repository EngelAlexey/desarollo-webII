export const requireRole = (...allowed) => (req, _res, next) => {
  const role = req.session?.user?.role;
  if (role && allowed.includes(role)) return next();
  return next({ status: 403, message: "Sin permisos" });
};
