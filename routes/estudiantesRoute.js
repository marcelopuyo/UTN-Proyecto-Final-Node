import express from 'express';
import { estudiantesController } from '../controllers/estudiantesController.js';
import { JWT } from "../data/jwtHelper.js";

const router = express.Router();

router.get('/', estudiantesController.getAll);
router.get('/:pagina/:limite', estudiantesController.getAllPaginated);
router.get('/q', estudiantesController.getByParams);
router.get('/:id', estudiantesController.getById);

router.post('/', JWT.ValidarToken, estudiantesController.add);
router.patch('/:id', JWT.ValidarToken, estudiantesController.update);
router.delete('/:id', JWT.ValidarToken, estudiantesController.delete);

router.patch('/altaInscripcion/:idEstudiante/:idCurso', JWT.ValidarToken, estudiantesController.altaInscripcion);
router.patch('/bajaInscripcion/:idEstudiante/:idCurso', JWT.ValidarToken, estudiantesController.bajaInscripcion);
router.patch('/calificar/:idEstudiante/:idCurso/:calificacion', JWT.ValidarToken, estudiantesController.calificar);

export const estudiantesRoute = router;
