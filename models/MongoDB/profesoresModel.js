import { mongoose, Schema } from "mongoose";

const profesorSchema = mongoose.Schema({
  dni: {
    type: Number, 
    unique: true,
    required: [true, 'El campo DNI es requerido']
  },
  nombre: {
    type: String, 
    required: [true, 'El campo Nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String, 
    required: [true, 'El campo Apellido es requerido'],
    trim: true
  },
  fecha_nacimiento: {
    type: Date, 
    required: [true, 'El campo Fecha de Nacimiento es requerido']
  },
  domicilio: {
    type: String,
    trim: true
  },
  cursos: [{curso: {type: Schema.Types.ObjectId, ref: 'Curso'},  cargo: {type: String}}]
},
{ timestamp: true});

profesorSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    ret.nombre_normalizado = ret.apellido + ', ' + ret.nombre;
    ret.fecha_de_nacimiento = (new Date(ret.fecha_nacimiento.toISOString()).toLocaleDateString("es-ES"));
    delete ret._id;
    delete ret.fecha_nacimiento;
    delete ret.__v;
  }
});

export const ProfesorModel = mongoose.model('Profesor', profesorSchema);