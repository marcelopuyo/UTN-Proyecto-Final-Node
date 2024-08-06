export default class responseModel {

   _resultado;
   _mensaje;
   _data;

   constructor() {
    this._resultado = true;
    this._mensaje = '';
    this._data = []; 
   }

  set resultado(value) {
    this._resultado = value;
    if (!value) this._data = []; 
  }

  set mensaje(value) {
    this._mensaje = value;
  }

  set data(value) {
    this._data = value;
    this._mensaje = '';
    this._resultado = true;
  }

  get data() {
    return this._data;
  }

  reponse() {
    return {
      'resultado': this._resultado,
      'mensaje': this._mensaje,
      'data': this._data
    }
  };

}