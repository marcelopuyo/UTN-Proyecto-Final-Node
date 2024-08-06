import { EstudianteModel } from '../models/MongoDB/estudiantesModel.js';
import { ProfesorModel } from '../models/MongoDB/profesoresModel.js';
import { CursoModel } from '../models/MongoDB/cursosModel.js';

import responseModel from '../models/responseModel.js';

let respuesta = new responseModel();

class CursosController {
  constructor() {}

  async getAll(req, res) {
    try {
      respuesta.data = await CursoModel.find()
        .populate('matricula.estudiante', '-cursos')
        .populate('catedra.profesor', '-cursos');

        if (respuesta.data) {
          respuesta.resultado = true;
          res.status(200);
        } else {
          respuesta.resultado = false;
          respuesta.mensaje = 'No hay cursos guardados';
          res.status(404);
        }
        return res.json(respuesta.reponse());
      } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async getAllPaginated(req, res) {
    let pagina = req.params.pagina;
    const limite = req.params.limite;

    try {
      const documentos = await CursoModel.countDocuments();
      const totalPaginas = Math.ceil(documentos / limite);
      pagina = pagina < 1 ? 1 : pagina;
      pagina = pagina > totalPaginas ? totalPaginas : pagina;

      respuesta.data = await CursoModel.find()
      .populate('matricula.estudiante', '-cursos')
      .populate('catedra.profesor', '-cursos')
      .limit(limite)
        .skip(limite * (pagina - 1));

        if (respuesta.data) {
          respuesta.resultado = true;
          res.status(200);
        } else {
          respuesta.resultado = false;
          respuesta.mensaje = 'No hay cursos guardados';
          res.status(404);
        };
        return res.json(respuesta.reponse());
      } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async getById(req, res) {
    const id = req.params.id;

    try {
      respuesta.data = await CursoModel.findById(id)
      .populate('matricula.estudiante', '-cursos')
      .populate('catedra.profesor', '-cursos');

      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Curso no encontrado';
        res.status(404);
      };
      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async getByParams(req, res) {
    const nombre = req.query.nombre;
    const departamento = req.query.departamento;

    let parametros = [];
    if (nombre) parametros.push({ nombre: { $regex: new RegExp(nombre, 'i') } });
    if (departamento)
      parametros.push({ departamento: { $regex: new RegExp(departamento, 'i') } });

    try {
      respuesta.data = await CursoModel.find({ $or: parametros })
      .populate('matricula.estudiante', '-cursos')
      .populate('catedra.profesor', '-cursos');

      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'No hay resultados';
        res.status(404);
      };
      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = 'entraaaaaaa';
      return res.status(404).json(respuesta.reponse());
    }
  }

  async add(req, res) {
    const curso = new CursoModel({
      nombre: req.body.nombre,
      departamento: req.body.departamento,
      fecha_inicio: req.body.fecha_inicio,
      fecha_finalizacion: req.body.fecha_finalizacion,
      arancel: req.body.arancel,
    });

    try {
      respuesta.data = await curso.save();
      respuesta.mensaje = 'Curso creado';

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      res.status(404).json(respuesta.reponse());
      return;
    }
  }

  async update(req, res) {
    const id = { _id: req.params.id };
    const datosAEditar = req.body;

    try {
      respuesta.data = await CursoModel.findOneAndUpdate(
        id,
        datosAEditar,
        { returnOriginal: false }
      );
      respuesta.mensaje = 'Curso modificado';

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      res.status(404).json(respuesta.reponse());
      return;
    }
  }

  async delete(req, res) {
    const id = req.params.id;

    try {
      const curso = await CursoModel.findById(id);

      //borrar el curso de todos los profesores que lo contengan
      if (curso?.catedra) {
        for (let idxProfesor of curso.catedra) {
          let profesor = await ProfesorModel.findById(idxProfesor.profesor._id);

          profesor.cursos = profesor.cursos.filter(
            (vcurso) => vcurso.curso._id != curso.id
          );

          await profesor.save();
        }
      }

      //borrar el curso de todos los estudiantes que lo contengan
      if (curso?.matricula) {
        for (let idxEstudiante of curso.matricula) {
          let estudiante = await EstudianteModel.findById(idxEstudiante.estudiante._id);

          estudiante.cursos = estudiante.cursos.filter(
            (vcurso) => vcurso.curso._id != curso.id
          );

          await estudiante.save();
        }
      }

      //borrar el curso
      respuesta.data = await CursoModel.findByIdAndDelete(id);
      respuesta.mensaje = 'Curso borrado';

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      console.log(error);
      res.status(404).json(respuesta.reponse());
      return;
    }
  }

}

export const cursosController = new CursosController();
