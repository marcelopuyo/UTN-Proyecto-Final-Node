import { mongoose, Schema } from "mongoose";

const usuarioSchema = Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    intentos_fallidos: { type: Number },
    bloqueado: { type: Boolean },
  },
  { timestamps: true }
);

usuarioSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret.intentos_fallidos;
    delete ret.bloqueado;
    delete ret._id;
    delete ret.__v;
  },
});

export const UsuarioModel = mongoose.model("Usuario", usuarioSchema);