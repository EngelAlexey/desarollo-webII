import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieSession from "cookie-session";
import rateLimit from "express-rate-limit";
import timeout from "connect-timeout";
import { createServer } from "http";

import { connectDB } from "./db.js";
import { ensureRoot } from "./seedRoot.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/categories.routes.js";

const app = express();
const server = createServer(app);

const {
  PORT = 4000,
  MONGO_URI = "mongodb://localhost:27017/practica3",
  SESSION_SECRET = "cambia-esto",
  CORS_ORIGIN = "http://localhost:5173",
  ROOT_EMAIL = "root@utn.local",
  ROOT_PASSWORD = "Root#2025",
  ROOT_NAME = "Root"
} = process.env;

// Middleware base
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: true, limit: "512kb" }));

// CORS
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use((_, res, next) => { res.setHeader("X-Powered-By", "UTN-API"); next(); });

// Helmet + CSP
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"]
    }
  }
}));

// Sesión basada en cookies
app.use(cookieSession({
  name: "sid",
  secret: SESSION_SECRET,
  httpOnly: true,
  sameSite: "lax",
  secure: false, // en producción: true (https)
  maxAge: 1000 * 60 * 60 // 1 hora
}));

// Timeouts y rate limit
server.keepAliveTimeout = 70_000;
server.headersTimeout = 75_000;
app.use(timeout("10s"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use(compression());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// Arranque
const bootstrap = async () => {
  await connectDB(MONGO_URI);
  await ensureRoot({ email: ROOT_EMAIL, password: ROOT_PASSWORD, name: ROOT_NAME });
  server.listen(PORT, () => console.log(`[API] http://localhost:${PORT}`));
};
bootstrap();
