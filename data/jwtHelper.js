import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const claveJWT = process.env.CLAVE_JWT;

export class JWT  {
  static GenerarToken(usuario) {
    const userForToken = {
      usuario: usuario.nombre,
      email: usuario.email,
    };

    return jwt.sign(userForToken, claveJWT, { expiresIn: process.env.PERIODO_VALIDEZ_TOKEN });
  };

  static async ValidarToken(req, res, next) {
    const token = req.headers?.authorization?.split(" ")[1];
    if (token) {
      jwt.verify(token, claveJWT, (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ success: false, message: "Token invalido." });
        }
        req.decoded = decoded;
        next();
      });
    } else {
      res.status(401).json({ success: false, message: "Token no recibido." });
    }
  };

  static EncriptarPsw(psw) {
    return bcrypt.hash(psw, Number(process.env.SALT_ROUNDS));
  };

  static async ValidarPsw(psw, pswEncriptada) {
    return await bcrypt.compare(psw, pswEncriptada)
  };
};