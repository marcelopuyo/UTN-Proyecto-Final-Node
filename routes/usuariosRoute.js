import express from 'express';
import { usuariosController } from '../controllers/usuariosController.js';
import { JWT } from "../data/jwtHelper.js";

const router = express.Router();

router.get('/login', usuariosController.login);
router.get('/q', JWT.ValidarToken, usuariosController.getByParams);
router.get('/:id', JWT.ValidarToken, usuariosController.getById);

router.post('/registrar', usuariosController.registrar);
router.patch('/:id', JWT.ValidarToken, usuariosController.update);
router.delete('/:id', JWT.ValidarToken, usuariosController.delete);

export const usuariosRoute = router;
