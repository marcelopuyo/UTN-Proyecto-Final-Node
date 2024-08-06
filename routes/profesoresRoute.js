import express from 'express';
import { profesoresController } from '../controllers/profesoresController.js';
import { JWT } from "../data/jwtHelper.js";

const router = express.Router();

router.get('/', profesoresController.getAll);
router.get('/:pagina/:limite', profesoresController.getAllPaginated);
router.get('/q', profesoresController.getByParams);
router.get('/:id', profesoresController.getById);

router.post('/', JWT.ValidarToken, profesoresController.add);

router.patch('/altaCatedra', JWT.ValidarToken, profesoresController.altaCatedra);
router.patch('/bajaCatedra', JWT.ValidarToken, profesoresController.bajaCatedra);
router.patch('/:id', JWT.ValidarToken, profesoresController.update);

router.delete('/:id', profesoresController.delete);



export const profesoresRoute = router;
