import { mongoose, Schema } from "mongoose";

const cursoSchema = mongoose.Schema({
  nombre: {
    type: String, 
    required: [true, 'El campo Nombre es requerido'],
    trim: true
  },
  departamento: {
    type: String, 
    required: [true, 'El campo Departamento es requerido'],
    trim: true
  },
  fecha_inicio: {
    type: Date, 
    required: [true, 'El campo Fecha de Inicio es requerido']
  },
  fecha_finalizacion: {
    type: Date, 
    required: [true, 'El campo Fecha de Finalizacion es requerido']
  },
  arancel: {
    type: Number
  },
  catedra: [{profesor: {type: Schema.Types.ObjectId, ref: 'Profesor'}, cargo: {type: String}}],
  matricula: [{estudiante: {type: Schema.Types.ObjectId, ref: 'Estudiante'}, calificacion: {type: Number}}]
},
{ timestamp: true});

cursoSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    ret.fecha_inicial = (new Date(ret.fecha_inicio.toISOString()).toLocaleDateString("es-ES"));
    ret.fecha_final = (new Date(ret.fecha_finalizacion.toISOString()).toLocaleDateString("es-ES"));
    delete ret._id;
    delete ret.fecha_inicio;
    delete ret.fecha_finalizacion;
    delete ret.__v;
    delete ret.catedra?._id;
    delete ret.matricula?._id;
  }
});

export const CursoModel = mongoose.model('Curso', cursoSchema);