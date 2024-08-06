import {connect} from 'mongoose';

async function _conectar() {
  try {
    await connect(process.env.MONGODB_CS);
    console.log('Base de datos conectada ...');
  } catch (error) {
    console.log('Error al conectar con la base de datos...');
    console.log(error);  
  }
}

export async function conectarDB() {
  await _conectar();
}
