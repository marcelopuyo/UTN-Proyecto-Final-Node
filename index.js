import express from 'express';
const server = express();

import {estudiantesRoute} from './routes/estudiantesRoute.js';
import {profesoresRoute} from './routes/profesoresRoute.js';
import {cursosRoute} from './routes/cursosRoute.js';
import {usuariosRoute} from './routes/usuariosRoute.js';

import bodyParser from 'body-parser';

import {conectarDB} from './data/connectionHelper.js'
await conectarDB();

server.use(bodyParser.json());

server.get('/', (req, res) => {
  res.send('API Conectada');
})

server.use('/estudiantes', estudiantesRoute);
server.use('/profesores', profesoresRoute);
server.use('/cursos', cursosRoute);
server.use('/usuarios', usuariosRoute);

server.listen(process.env.PORT, () => {
  console.log('Servidor escuchando en puerto:', process.env.PORT, '...',
    '\nPresione CTRL + C para terminar'
  );
});
