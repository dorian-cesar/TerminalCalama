const contenedorQR = document.getElementById('contenedorQR');
const contenedorContador = document.getElementById("keycont");
contenedorContador.value = "Contador";
const genQR = document.getElementById('generar');
const QR = new QRCode(contenedorQR);
QR.makeCode('wit');

leerDatosServer();

//const fechaHoraActual = new Date();
//const fechaActual = fechaHoraActual.toISOString().split('T')[0];
//const horaActual = fechaHoraActual.toLocaleTimeString();

var numero=0
  // URL del endpoint en tu servidor PHP
  const url = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Restroom/save.php';


  genQR.addEventListener('click', (e) => {
    e.preventDefault();
    genQR.disabled = true;
    genQR.classList.add('disabled');
    // Generamos un nuevo Date() para obtener la fecha y hora al momento de hacer Click
    const fechaHoraAct = new Date();

    const horaStr = fechaHoraAct.getHours() + ":" + fechaHoraAct.getMinutes() + ":" + fechaHoraAct.getSeconds()
    const fechaStr = fechaHoraAct.toISOString().split('T')[0];

    const tipoStr = document.querySelector('input[name="tipo"]:checked').value;

    //console.log(tipoStr);

    const numeroT=generarTokenAlfanumerico(6);
   // var numeroT='XXX'+numero++ ;
    const datos = {
        Codigo: numeroT,
        hora: horaStr,
        fecha: fechaStr,
        tipo: tipoStr
      };
    
    callApi(datos)
    .then(res => {
      QR.makeCode(numeroT);
      contenedorContador.value = numeroT;
      leerDatosServer();
      genQR.disabled = false;
      genQR.classList.remove('disabled');
    });
    
});

function escribirTexto(){
    contenedorContador.innerHTML="texto";
};

async function callApi (datos){
  let ret = await fetch(url, {
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
    return ret;
  }

  
    function generarTokenAlfanumerico(longitud) {
        const caracteres = 'uMyG5Ro7eVdqtXKsC4nbg1acfzWx9iYQS3DLh2E6lOwmNHkZITjpPF8BArU0vJ';
        let tokenn = '';
    
        for (let i = 0; i < longitud; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            tokenn += caracteres.charAt(indice);
        }
        //console.log(tokenn);
        return tokenn;
    }
    
    // Ejemplo de uso para un token de 6 caracteres
   // const miToken = generarTokenAlfanumerico(6);

   function leerDatosServer() {
    const endpointURL = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Restroom/load.php';
    
    fetch(endpointURL)
        .then(response => response.json())
        .then(data => {
            // Construir filas de la tabla
            const filasHTML = data.map(item => `
                <tr>
                    <td>${item.idrestroom}</td>
                    <td>${item.Codigo}</td>
                    <td>${item.tipo}</td>
                    <td>${item.date}</td>
                    <td>${item.time}</td>
                </tr>
            `).join('');

            // Actualizar el contenido de la tabla
            document.getElementById('tabla-body').innerHTML = filasHTML;
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
        });
   }

   function printQR() {
       const ventanaImpr = window.open('', '_blank');
   
       // Obtenemos la fecha actual
       const dateAct = new Date();
       // Separamos hora y fecha en constantes unicas
       const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+':'+dateAct.getSeconds();
       const fechaStr = dateAct.toISOString().split('T')[0];

       // Importante: Eventualmente la funcion de imprimir se
       // disparará al momento de generar el QR, para motivos de
       // demostración, obtenemos el valor actual del radio,
       // pero este puede ser distinto al valor del ticket
       // si el operador lo cambia
       const tipoStr = document.querySelector('input[name="tipo"]:checked').value;
   
       ventanaImpr.document.write('<html><head><title>Imprimir QR</title></head><body style="text-align:center; width: min-content;">');
       ventanaImpr.document.write(`<h1>Ticket de ${tipoStr}</h1>`);
       ventanaImpr.document.write(`<h3>${fechaStr} ${horaStr}</h3>`);
       ventanaImpr.document.write(contenedorQR.innerHTML);
       ventanaImpr.document.write('</body></html>');
   
       ventanaImpr.document.close();
   
       ventanaImpr.print();
   }
  
  


