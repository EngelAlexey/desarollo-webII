import mongoose from "mongoose";
import crypto from "crypto";

export const ROLES = ["Root", "Admin", "User", "Guest"];

const UserSchema = new mongoose.Schema({
  email:  { type: String, unique: true, required: true, lowercase: true, trim: true },
  name:   { type: String, required: true },
  role:   { type: String, enum: ROLES, default: "User" },
  salt:   { type: String, required: true },
  hash:   { type: String, required: true },
  locked: { type: Boolean, default: false } // el Root queda protegido
}, { timestamps: true });

UserSchema.methods.setPassword = function (pwd) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(pwd, this.salt, 310000, 32, "sha256").toString("hex");
};
UserSchema.methods.verify = function (pwd) {
  const h = crypto.pbkdf2Sync(pwd, this.salt, 310000, 32, "sha256").toString("hex");
  return this.hash === h;
};

export default mongoose.model("User", UserSchema);
