// src/scripts/resetRoot.js
import { connectDB } from "../db.js";
import User from "../models/User.js";

const email = process.argv[2] || process.env.ROOT_EMAIL;
const password = process.argv[3] || process.env.ROOT_PASSWORD;

if (!email || !password) {
  console.error('Uso: node --env-file=.env src/scripts/resetRoot.js <email> <password>');
  process.exit(1);
}

await connectDB(process.env.MONGO_URI);
const u = await User.findOne({ email, role: "Root" });
if (!u) { console.error("No existe Root con ese email."); process.exit(1); }
u.setPassword(password);
await u.save();
console.log("✔ Password del Root actualizado a:", password);
process.exit(0);
