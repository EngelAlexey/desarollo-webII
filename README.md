UTN — Práctica 03: API REST segura (MongoDB + Roles + Controles)

API REST en Node.js/Express con MongoDB que implementa el CRUD de Categories (incluye imagen como BLOB y su MIME), autenticación por sesión, autorización por roles (Root, Admin, User, Guest) y controles de seguridad (CORS, Helmet + CSP, rate limit, body limits, validaciones, timeouts, keep-alive).  
Incluye colección de Postman, guía de despliegue y resultados de auditoría (`npm audit`) y pruebas.

📁 Estructura del proyecto/
practica3/
├─ .env
├─ package.json
├─ src/
│ ├─ index.js # arranque express + seguridad + rutas
│ ├─ db.js # conexión mongoose
│ ├─ seedRoot.js # crea el usuario Root si no existe
│ ├─ models/
│ │ ├─ Category.js # CategoryID, CategoryName, Description, Image, Mime
│ │ └─ User.js # email, name, role, hash/salt, locked
│ ├─ middlewares/
│ │ ├─ auth.js # requireAuth
│ │ ├─ roles.js # requireRole(...)
│ │ └─ validate.js # zod → validar body/params
│ └─ routes/
│ ├─ auth.routes.js # login, logout, me, root/change-password
│ ├─ users.routes.js # ABM de usuarios (solo Root)
│ └─ categories.routes.js # CRUD + imagen
└─ docs/
├─ postman/UTN_Practica3_API.postman_collection.json
└─ capturas/ (evidencias de Postman y resultados)

Requisitos

- Node.js ≥ 18 (probado con 22.x)  
- MongoDB local o Atlas  
- (Opcional) Docker para Mongo  
- Postman (para las pruebas manuales)

Configuración

1. Clonar el repositorio y entrar a la carpeta `practica3`.
2. Instalar dependencias: npm install
3. Ejecutar: npm run dev

Endpoints principales

Health
GET /api/health → { ok:true, uptime, time }

Auth
POST /api/auth/login → inicia sesión por cookie
Body (JSON): { "email": "root@utn.local", "password": "Root#2025" }
GET /api/auth/me → datos de sesión
POST /api/auth/logout
POST /api/auth/root/change-password (solo Root)
Body: { "password": "Nuevo#2025" }

Users (solo Root)
GET /api/users → lista (sin datos sensibles)
POST /api/users → crea Admin/User/Guest (no Root)
Body: { "email","name","role","password" }
PATCH /api/users/:id → actualizar name/role (no Root)
DELETE /api/users/:id → borrar (no Root)

Categories
GET /api/categories → listado (público)
GET /api/categories/:id → detalle
GET /api/categories/:id/image → imagen (MIME correcto)
POST /api/categories (Admin/Root) → multipart/form-data
Campos: CategoryID, CategoryName, Description?, image?
PUT /api/categories/:id (Admin/Root) → multipart/form-data
DELETE /api/categories/:id (Root)

Seguridad aplicada

CORS con origin controlado + credentials.
Helmet con CSP (permite img-src 'self' data: para servir BLOBs).
Sesión por cookie (httpOnly, sameSite=lax, maxAge).
Rate limit: 100 req / 15 min (código 429 si se excede).
Body limits: 512kb JSON/urlencoded y 800kb archivos (multer).
Validaciones con zod (body/params).
Timeouts y keep-alive configurados.
X-Powered-By personalizado.

Modelos

Category:
CategoryID (unique), CategoryName, Description, Image (Buffer), Mime (String)

User:
email (unique), name, role ['Root','Admin','User','Guest'], salt+hash (PBKDF2), locked (Root)

Pruebas con Postman
Colección: docs/postman/UTN_Practica3_API.postman_collection.json

Secuencia típica:
Auth / Login (Root)
Categories / Listar (público)
Categories / Crear (usar form-data; opcional imagen ≤ 800 KB)
Categories / Obtener por ID
Categories / Imagen por ID
Categories / Actualizar
Categories / Borrar (solo Root)
Users / Listar (solo Root), Users / Crear, Users / PATCH, Users / DELETE
Auth / Root - Cambiar Password
Health

Pruebas diseñadas con IA (ataques)
