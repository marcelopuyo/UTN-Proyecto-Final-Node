import express from 'express';
import { cursosController } from '../controllers/cursosController.js'
import { JWT } from "../data/jwtHelper.js";

const router = express.Router();

router.get('/', cursosController.getAll);
router.get('/:pagina/:limite', cursosController.getAllPaginated);
router.get('/q', cursosController.getByParams);
router.get('/:id', cursosController.getById);

router.post('/', JWT.ValidarToken, cursosController.add);
router.patch('/:id', JWT.ValidarToken, cursosController.update);
router.delete('/:id', JWT.ValidarToken, cursosController.delete);

// router.patch('/altaInscripcion/:idEstudiante/:idCurso', estudiantesController.altaInscripcion);
// router.patch('/bajaInscripcion/:idEstudiante/:idCurso', estudiantesController.bajaInscripcion);
// router.patch('/calificar/:idEstudiante/:idCurso/:calificacion', estudiantesController.calificar);

export const cursosRoute = router;
