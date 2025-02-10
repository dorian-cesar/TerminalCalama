const contenedorQR = document.getElementById('contenedorQR');
const contenedorContador = document.getElementById("keycont");
contenedorContador.value = "Contador";
const genQR = document.getElementById('generar');
const QR = new QRCode(contenedorQR);
QR.makeCode('wit');
//urlBase='http://localhost';
urlBase='https://andenes.terminal-calama.com';

console.log (urlBase);


leerDatosServer();

//const fechaHoraActual = new Date();
//const fechaActual = fechaHoraActual.toISOString().split('T')[0];
//const horaActual = fechaHoraActual.toLocaleTimeString();

var numero=0
  // URL del endpoint en tu servidor PHP
  const url = urlBase+'/TerminalCalama/PHP/Restroom/save.php';


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

    const numeroT=generarTokenNumerico();
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
      addUser(numeroT);
      let name=numeroT.substring(0,6);
      console.log(name);
      addUserAccessLevel(name);
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


  function generarTokenNumerico() {
    let token = (Math.floor(Math.random() * 9) + 1).toString(); // Primer dígito entre 1 y 9 (convertido a string)
    for (let i = 1; i < 10; i++) {
        token += Math.floor(Math.random() * 10); // Agregar dígitos entre 0 y 9
    }
    return token;
}


    // Ejemplo de uso para un token de 6 caracteres
   // const miToken = generarTokenAlfanumerico(6);

   function leerDatosServer() {
    const endpointURL = urlBase +'/TerminalCalama/PHP/Restroom/load.php';

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

    // Obtenemos la fecha y hora actual
    const dateAct = new Date();
    const horaStr = dateAct.getHours().toString().padStart(2, '0') + ':' +
                    dateAct.getMinutes().toString().padStart(2, '0') + ':' +
                    dateAct.getSeconds().toString().padStart(2, '0');
    const fechaStr = dateAct.toISOString().split('T')[0];

    // Obtener el código QR generado
    const codigoQR = document.getElementById('keycont').value;
    const tipoSeleccionado = document.querySelector('input[name="tipo"]:checked').value;

    if (!codigoQR) {
        alert("No hay código QR generado para imprimir.");
        return;
    }

    // Obtener el precio desde restroom.js
    const precio = restroom[tipoSeleccionado] !== undefined ? `$${restroom[tipoSeleccionado]}` : "No definido";

    ventanaImpr.document.write(`
        <html>
            <head>
                <title>Imprimir QR</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; }
                    h1, h3 { margin: 5px; }
                    .qr-container { display: flex; justify-content: center; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Ticket de Acceso</h1>
                <h3>Fecha: ${fechaStr}</h3>
                <h3>Hora: ${horaStr}</h3>
                <h3>Tipo: ${tipoSeleccionado}</h3>
                <h3>Precio: ${precio}</h3>
                <h3>Código: ${codigoQR}</h3>
                <div class="qr-container">
                    ${document.getElementById('contenedorQR').innerHTML}
                </div>
            </body>
        </html>
    `);
    ventanaImpr.document.close();
    
    setTimeout(function() {
        ventanaImpr.print();
    }, 500);
}


    function addUser(token) {
    const url = urlBase+'/TerminalCalama/PHP/Restroom/addUser.php';

    const userData = {
        pin: token,
        idNo: token
    };

    try {
        let response =  fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        let result =  response.text();
        console.log('Respuesta de addUser:', result);
    } catch (error) {
        console.error('Error al agregar usuario:', error);
    }
}

// Función para asignar niveles de acceso al usuario
 function addUserAccessLevel(token) {
  const url = urlBase+'/TerminalCalama/PHP/Restroom/addLevelUser.php';

  const accessData = {
      pin: token
  };

  try {
      let response =  fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(accessData)
      });

      let result =  response.text();
      console.log('Respuesta de addLevelUser:', result);
  } catch (error) {
      console.error('Error al asignar niveles de acceso:', error);
  }
}