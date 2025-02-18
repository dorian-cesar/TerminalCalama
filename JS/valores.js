var restroom = {
    Baño: 500, 
    Ducha: 4000        
  };



var valoresBulto = {
    "S Bolso Pequeño": 2200,
    "M Maleta Mediana": 2500,
    "L Maleta Grande": 3200,
    "XL Equipaje Extra Grande": 3400,
    "XXL Sacos / Fardos": 4500
};

function getValorBulto(tamaño) {
    return valoresBulto[tamaño] || 0;  // Devuelve el valor correspondiente o 0 si no se encuentra el tamaño
}

function inicializarValores() {
    document.getElementById("valorBaño").textContent = `$${restroom.Baño}`;
    document.getElementById("valorDucha").textContent = `$${restroom.Ducha}`;
    }

document.addEventListener("DOMContentLoaded", function () {
    inicializarValores();
})