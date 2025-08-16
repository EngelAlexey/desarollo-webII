import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  CategoryID:   { type: String, required: true, unique: true, trim: true },
  CategoryName: { type: String, required: true, trim: true },
  Description:  { type: String, default: "" },
  Image:        { type: Buffer }, // imagen en binario (opcional)
  Mime:         { type: String, default: "" } // mime-type de la imagen
}, { timestamps: true });

export default mongoose.model("Category", CategorySchema);
