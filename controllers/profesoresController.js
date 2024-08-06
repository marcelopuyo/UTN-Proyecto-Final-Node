import { ProfesorModel } from '../models/MongoDB/profesoresModel.js';
import { CursoModel } from '../models/MongoDB/cursosModel.js';

import responseModel from '../models/responseModel.js';

let respuesta = new responseModel();

class ProfesoresController {
  constructor() {}

  async getAll(req, res) {
    try {
      respuesta.data = await ProfesorModel.find()
        .populate('cursos.curso', '-matricula -catedra');

        if (respuesta.data) {
          respuesta.resultado = true;
          res.status(200);
        } else {
          respuesta.resultado = false;
          respuesta.mensaje = 'No hay profesores guardados';
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
      const documentos = await ProfesorModel.countDocuments();
      const totalPaginas = Math.ceil(documentos / limite);
      pagina = (pagina < 1) ? 1 : pagina;
      pagina = (pagina > totalPaginas) ? totalPaginas : pagina;

      respuesta.data = await ProfesorModel.find()
        .populate('cursos.curso', '-matricula -catedra')
        .limit(limite)
        .skip(limite*(pagina-1));

        if (respuesta.data) {
          respuesta.resultado = true;
          res.status(200);
        } else {
          respuesta.resultado = false;
          respuesta.mensaje = 'No hay profesores guardados';
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
      respuesta.data = await ProfesorModel.findById(id)
        .populate('cursos.curso', '-matricula -catedra');

        if (respuesta.data) {
          respuesta.resultado = true;
          res.status(200);
        } else {
          respuesta.resultado = false;
          respuesta.mensaje = 'Profesor no encontrado';
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
    if (apellido) parametros.push({ apellido: { $regex: new RegExp(apellido, 'i') } });

    console.log(dni, apellido);

    try {
      respuesta.data = await ProfesorModel.find({$or: parametros})
        .populate('cursos.curso', '-matricula -catedra');

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
    const profesor = new ProfesorModel({
      dni: req.body.dni,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      fecha_nacimiento: req.body.fecha_nacimiento,
      domicilio: req.body.domicilio,
    });

    try {
      respuesta.data = await profesor.save();
      respuesta.mensaje = 'Profesor creado';

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
      respuesta.data = await ProfesorModel.findOneAndUpdate(
        id,
        datosAEditar,
        { returnOriginal: false }
      );
      respuesta.mensaje = 'Profesor modificado';

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
      respuesta.data = await ProfesorModel.findByIdAndDelete(id);
      respuesta.mensaje = 'Profesor borrado';

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      res.status(404).json(respuesta.reponse());
      return;    
    }
  }

  async altaCatedra(req, res) {
    //const idCurso = req.params.idCurso;
    const idProfesor = req.query.idProfesor;
    const idCurso = req.query.idCurso;
    const cargo = req.query.cargo;

    let profesor;
    let curso;

    //validar id profesor
    try {
      profesor = await ProfesorModel.findById(idProfesor);
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = 'Profesor no encontrado';

      res.status(404).json(respuesta.reponse());
      return;
    }

    //validar id curso
    try {
      curso = await CursoModel.findById(idCurso);
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = 'Curso no encontrado';

      res.status(404).json(respuesta.reponse());
      return;    }

    //validar que el profesor no forme parte de la catedra
    if (curso.catedra.find(p => p.profesor._id == profesor.id)) {
      respuesta.resultado = false;
      respuesta.mensaje = 'El profesor ya forma parte de la catedra';

      res.status(404).json(respuesta.reponse());
      return;    
    }

    //validar que el curso no este finalizado
    if (curso.fecha_finalizacion < Date.now.Date) {
      respuesta.resultado = false;
      respuesta.mensaje = 'El curso se encuentra finalizado';

      res.status(404).json(respuesta.reponse());
      return;
    }

    try {
      profesor.cursos.push({ curso: curso.id, cargo: cargo });
      respuesta.data = await profesor.save();

      curso.catedra.push({ profesor: profesor.id, cargo: cargo });
      await curso.save();

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;

      res.status(404).json(respuesta.reponse());
      return;    
    }
  }

  async bajaCatedra(req, res) {
    const idCurso = req.query.idCurso;
    const idProfesor = req.query.idProfesor;

    try {
      const curso = await CursoModel.findById(idCurso);
      const profesor = await ProfesorModel.findById(idProfesor);

      profesor.cursos = profesor.cursos.filter(
        (cursos) => cursos.curso != curso.id
      );
      respuesta.data = await profesor.save();

      curso.catedra = curso.catedra.filter(
        (catedra) => catedra.profesor != profesor.id
      );
      await curso.save();

      res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;

      res.status(404).json(respuesta.reponse());
      return;    
    }
  }
  
}

export const profesoresController = new ProfesoresController();
