const contenedorQR = document.getElementById('contenedorQR');
const contenedorContador = document.getElementById('contador');
contenedorContador.innerHTML="Contador";
const QR = new QRCode(contenedorQR);
QR.makeCode('wit');

leerDatosServer();

const fechaHoraActual = new Date();
const fechaActual = fechaHoraActual.toISOString().split('T')[0];
const horaActual = fechaHoraActual.toLocaleTimeString();

var numero=0
  // URL del endpoint en tu servidor PHP
  const url = 'http://localhost/terminal/ba%C3%B1os/codigo/server.php';


function escribirQR (){
    const numeroT=generarTokenAlfanumerico(6);
   // var numeroT='XXX'+numero++ ;
    const datos = {
        Codigo: numeroT,
        hora: horaActual,
        fecha: fechaActual,
        
      };
    callApi(datos);
    QR.makeCode(numeroT);
    contenedorContador.innerHTML=numeroT;
   
    leerDatosServer();
    //imprimirDiv()
    
};

function escribirTexto(){

    contenedorContador.innerHTML="texto";
};


 
  function callApi (datos){

    
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(response => {
      // Verificar la respuesta del servidor
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      return response.text(); // Devolver la respuesta como texto
    })
    .then(result => {
      // Manejar la respuesta del servidor
      console.log('Respuesta del servidor:', result);
    })
    .catch(error => {
      // Capturar y manejar errores
      console.error('Error al enviar la solicitud:', error);
    });

    

  }

  
    function generarTokenAlfanumerico(longitud) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tokenn = '';
    
        for (let i = 0; i < longitud; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            tokenn += caracteres.charAt(indice);
        }
        console.log(tokenn);
        return tokenn;
    }
    
    // Ejemplo de uso para un token de 6 caracteres
   // const miToken = generarTokenAlfanumerico(6);

   function leerDatosServer() {
    const endpointURL = 'http://localhost/terminal/ba%C3%B1os/codigo/leerDatos.php';
    
    fetch(endpointURL)
        .then(response => response.json())
        .then(data => {
            // Construir filas de la tabla
            const filasHTML = data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.Codigo}</td>
                    <td>${item.Fecha}</td>
                    <td>${item.Hora}</td>
                </tr>
            `).join('');

            // Actualizar el contenido de la tabla
            document.getElementById('tabla-body').innerHTML = filasHTML;
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
        });
   }

        function imprimirDiv() {
    // Crear una ventana emergente temporal
    const ventanaImpresion = window.open('', '_blank');
    
    // Obtener el contenido del div que quieres imprimir
    const contenidoDiv = document.getElementById('contenedorQR').innerHTML;

    const contadorDiv = document.getElementById('contador').innerHTML;

       // Escribir el contenido en la ventana emergente
    ventanaImpresion.document.write('<html><head><title>Imprimir Div</title></head><body>');
    ventanaImpresion.document.write('<h1>QR Baños</h1>');
   
    ventanaImpresion.document.write(contenidoDiv);


    
    ventanaImpresion.document.write('</body></html>');

    ventanaImpresion.document.close(); // Cerrar la escritura en la ventana emergente

    setTimeout(imprimir, 50);

    function imprimir(){
    ventanaImpresion.print();
    
}

}

    
  
    
  
  


