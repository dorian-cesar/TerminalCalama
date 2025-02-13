var restroom = {
    Baño: 500, 
    Ducha: 4000        
  };


var valoresBulto = {
  "Small": 2200,
  "Medium": 2500,
  "Large": 3200,
  "Extra_Large": 3400,
  "Extra_Extra_Large": 4500
};

function getValorBulto(tamaño) {
  return valoresBulto[tamaño] || 0;  // Devuelve el valor correspondiente o 0 si no se encuentra el tamaño
}
