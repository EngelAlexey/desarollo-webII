import User from "./models/User.js";

export async function ensureRoot({ email, password, name }) {
  let root = await User.findOne({ role: "Root", locked: true });
  if (!root) {
    root = new User({ email, name, role: "Root", salt: "x", hash: "y", locked: true });
    root.setPassword(password);
    await root.save();
    console.log("[Seed] Root creado:", email);
  } else {
    console.log("[Seed] Root existente:", root.email);
  }
}
