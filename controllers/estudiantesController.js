import { EstudianteModel } from '../models/MongoDB/estudiantesModel.js';
import { CursoModel } from '../models/MongoDB/cursosModel.js';

import responseModel from '../models/responseModel.js';

let respuesta = new responseModel();

class EstudiantesController {
  constructor() {}

  async getAll(req, res) {
    try {
      respuesta.data = await EstudianteModel.find().populate(
        'cursos.curso',
        '-matricula -catedra'
      );

      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'No hay estudiantes guardados';
        res.status(404);
      }
      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      console.log(error.stack)
      return res.status(404).json(respuesta.reponse());
    }
  }

  async getAllPaginated(req, res) {
    let pagina = req.params.pagina;
    const limite = req.params.limite;

    try {
      const documentos = await EstudianteModel.countDocuments();
      const totalPaginas = Math.ceil(documentos / limite);
      pagina = pagina < 1 ? 1 : pagina;
      pagina = pagina > totalPaginas ? totalPaginas : pagina;

      respuesta.data = await EstudianteModel.find()
        .populate('cursos.curso', '-matricula -catedra')
        .limit(limite)
        .skip(limite * (pagina - 1));

      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'No hay estudiantes guardados';
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
      respuesta.data = await EstudianteModel.findById(id).populate(
        'cursos.curso',
        '-matricula -catedra'
      );

      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Estudiante no encontrado';
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
    const dni = req.query.dni;
    const apellido = req.query.apellido;

    let parametros = [];
    if (dni) parametros.push({ dni: dni });
    if (apellido)
      parametros.push({ apellido: { $regex: new RegExp(apellido, 'i') } });

    try {
      respuesta.data = await EstudianteModel.find({ $or: parametros }).populate(
        'cursos.curso',
        '-matricula -catedra'
      );

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
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async add(req, res) {
    const estudiante = new EstudianteModel({
      dni: req.body.dni,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      fecha_nacimiento: req.body.fecha_nacimiento,
      domicilio: req.body.domicilio,
    });

    try {
      respuesta.data = await estudiante.save();
      respuesta.mensaje = 'Estudiante creado';
      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async update(req, res) {
    const id = { _id: req.params.id };
    const datosAEditar = req.body;

    try {
      respuesta.data = await EstudianteModel.findOneAndUpdate(
        id,
        datosAEditar,
        { returnOriginal: false }
      );
      respuesta.mensaje = 'Estudiante modificado';

      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async delete(req, res) {
    const id = req.params.id;

    try {
      respuesta.data = await EstudianteModel.findByIdAndDelete(id);
      respuesta.mensaje = 'Estudiante borrado';

      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async altaInscripcion(req, res) {
    const idCurso = req.params.idCurso;
    const idEstudiante = req.params.idEstudiante;

    let estudiante;
    let curso;

    //validar id estudiante
    try {
      estudiante = await EstudianteModel.findById(idEstudiante);
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = 'Estudiante no encontrado';

      return res.status(404).json(respuesta.reponse());
    }

    //validar id curso
    try {
      curso = await CursoModel.findById(idCurso);
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = 'Curso no encontrado';

      return res.status(404).json(respuesta.reponse());
    }

    //validar que el estudiante no este inscripto
    if (curso.matricula.find((p) => p.estudiante._id == estudiante.id)) {
      respuesta.resultado = false;
      respuesta.mensaje = 'El alumno ya se encuentra inscripto al curso';

      return res.status(404).json(respuesta.reponse());
    }

    //validar que el curso no este finalizado
    if (curso.fecha_finalizacion < Date.now.Date) {
      respuesta.resultado = false;
      respuesta.mensaje = 'El curso se encuentra finalizado';

      return res.status(404).json(respuesta.reponse());
    }

    try {
      estudiante.cursos.push({ curso: curso.id, calificacion: null });
      respuesta.data = await estudiante.save();

      curso.matricula.push({ estudiante: estudiante.id, calificacion: null });
      await curso.save();

      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;

      return res.status(404).json(respuesta.reponse());
    }
  }

  async bajaInscripcion(req, res) {
    const idCurso = req.params.idCurso;
    const idEstudiante = req.params.idEstudiante;

    try {
      const curso = await CursoModel.findById(idCurso);
      const estudiante = await EstudianteModel.findById(idEstudiante);

      estudiante.cursos = estudiante.cursos.filter(
        (cursos) => cursos.curso != curso.id
      );
      respuesta.data = await estudiante.save();

      curso.matricula = curso.matricula.filter(
        (matricula) => matricula.estudiante != estudiante.id
      );
      await curso.save();

      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;

      return res.status(404).json(respuesta.reponse());
    }
  }

  async calificar(req, res) {
    const idCurso = req.params.idCurso;
    const idEstudiante = req.params.idEstudiante;
    const calificacion = req.params.calificacion;

    try {
      const curso = await CursoModel.findById(idCurso);
      const estudiante = await EstudianteModel.findById(idEstudiante);

      const idxEstudiante = estudiante.cursos.findIndex(
        (cursos) => (cursos.curso = curso.id)
      );
      estudiante.cursos[idxEstudiante].calificacion = parseInt(calificacion);
      respuesta.data = await estudiante.save();

      const idxCurso = curso.matricula.findIndex(
        (matricula) => (matricula.estudiante = estudiante.id)
      );
      curso.matricula[idxCurso].calificacion = parseInt(calificacion);
      await curso.save();

      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;

      return res.status(404).json(respuesta.reponse());
    }
  }
}

export const estudiantesController = new EstudiantesController();
