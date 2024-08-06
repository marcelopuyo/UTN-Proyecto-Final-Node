import { UsuarioModel } from '../models/MongoDB/usuariosModel.js';
import { JWT } from "../data/jwtHelper.js";

import responseModel from '../models/responseModel.js';

let respuesta = new responseModel();


class UsuariosController {

  async getById(req, res) {
    try {
      respuesta.data = await UsuarioModel.findById(req.params.id);
      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Usuario no encontrado';
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
    const email = req.query.email;

    let parametros = [];
    if (nombre) parametros.push({ nombre: { $regex: new RegExp(nombre, 'i') } });
    if (email) parametros.push({ email: { $regex: new RegExp(email, 'i') } });

    try {
      respuesta.data = await UsuarioModel.find({ $or: parametros });
      if (respuesta.data) {
        respuesta.resultado = true;
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Usuario no encontrado';
        res.status(404);
      };
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
      respuesta.data = await UsuarioModel.findOneAndUpdate(
        id,
        datosAEditar,
        { returnOriginal: false }
      );

      if (respuesta.data) {
        respuesta.mensaje = 'Usuario modificado';
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Usuario no encontrado';
        res.status(404);
      }
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
      respuesta.data = await UsuarioModel.findByIdAndDelete(id);

      if (respuesta.data) {
        respuesta.resultado = true;
        respuesta.mensaje = 'Usuario borrado';
        res.status(200);
      } else {
        respuesta.resultado = false;
        respuesta.mensaje = 'Usuario no encontrado';
        res.status(404);
      }
      return res.json(respuesta.reponse());
    } catch (error) {
      respuesta.resultado = false;
      respuesta.mensaje = error.message;
      return res.status(404).json(respuesta.reponse());
    }
  }

  async registrar(req, res) {
    const { nombre, email } = req.body;

    const usuario = await UsuarioModel.find().where({ email: email });
    if (usuario.length) {
        respuesta.resultado = false;
        respuesta.mensaje = 'Usuario existente';
  
        res.status(401).json(respuesta.reponse());
        return;
    }

    const password = await JWT.EncriptarPsw(req.body.password);
    const data = { nombre, email, password, intentos_fallidos: 0, bloqueado: false };
    const newUsuario = new UsuarioModel(data);
    try {
      const usuarioGuardado = await newUsuario.save();
        respuesta.resultado = true;
        respuesta.mensaje = 'Usuario registrado';
  
        res.status(201).json(respuesta.reponse());
        return;
  
    } catch (error) {
        respuesta.resultado = false;
        respuesta.mensaje = error.message;
  
        res.status(500).json(respuesta.reponse());
        return;
    }
  };

  async login(req, res) {
    const usuarios = await UsuarioModel.find().where({ email: req.body.email });
    if (!usuarios.length) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const usuario = usuarios[0];

    const match = await JWT.ValidarPsw(req.body.password, usuario.password);

    if (!match) {
      usuario.intentos_fallidos = usuario.intentos_fallidos + 1;
      if (usuario.intentos_fallidos >= 3) usuario.bloqueado = true;

      usuario.save();

      return res
        .status(401)
        .json({ success: false, message: "Usuario o contraseña incorrectos" });
    } else {
      usuario.intentos_fallidos = 0;
      usuario.save();
    };

    if (usuario.bloqueado === true) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario bloqueado" });
    };

    const token = JWT.GenerarToken(usuarios[0]);
    res
      .status(200)
      .json({ sucess: true, message: "Usuario logueado", data: token });
  };
};

export const usuariosController = new UsuariosController();
