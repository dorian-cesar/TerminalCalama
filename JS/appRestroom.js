const contenedorQR = document.getElementById('contenedorQR');
const contenedorContador = document.getElementById("keycont");
contenedorContador.value = "Contador";
const genQR = document.getElementById('generar');
const QR = new QRCode(contenedorQR);
QR.makeCode('wit');
urlBase='http://localhost';
//urlBase='https://andenes.terminal-calama.com';

const urlServer = 'https://andenes.terminal-calama.com'

const urlLoad = urlServer + '/TerminalCalama/PHP/Restroom/load.php';
const urlSave = urlServer + '/TerminalCalama/PHP/Restroom/save.php';
const urlAddUser = urlServer + '/TerminalCalama/PHP/Restroom/addUser.php';
const urlLevelUser = urlServer + '/TerminalCalama/PHP/Restroom/addLevelUser.php';

console.log (urlBase);


leerDatosServer();

//const fechaHoraActual = new Date();
//const fechaActual = fechaHoraActual.toISOString().split('T')[0];
//const horaActual = fechaHoraActual.toLocaleTimeString();

var numero=0
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
      
      setTimeout(() => {
        let name = numeroT.substring(0, 6);
        console.log(name);
        addUserAccessLevel(name);
    }, 1000)
    });
});

function escribirTexto(){
    contenedorContador.innerHTML="texto";
};

async function callApi (datos){
  let ret = await fetch(urlSave, {
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


function leerDatosServer() {
fetch(urlLoad)
    .then(response => response.json())
    .then(data => {
        datosGlobales = data; // Almacenar datos globalmente
        aplicarFiltros(); // Aplicar filtros actuales
    })
    .catch(error => {
        console.error('Error al obtener datos:', error);
    });
}

    // Función para aplicar filtros
function aplicarFiltros() {
    const codigoFiltro = document.getElementById('buscador-codigo').value.toLowerCase();
    const tipoFiltro = document.getElementById('filtro-tipo').value;
    const fechaFiltro = document.getElementById('filtro-fecha').value; // Obtener la fecha seleccionada

    const datosFiltrados = datosGlobales.filter(item => {
        const coincideCodigo = item.Codigo.toLowerCase().includes(codigoFiltro);
        const coincideTipo = tipoFiltro === '' || item.tipo === tipoFiltro;

        // Filtrar por fecha
        const coincideFecha = fechaFiltro === '' || item.date === fechaFiltro;

        return coincideCodigo && coincideTipo && coincideFecha;
    });

    // Generar HTML para la tabla
    const filasHTML = datosFiltrados.map(item => `
        <tr>
            <td>${item.idrestroom}</td>
            <td>${item.Codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.date}</td>
            <td>${item.time}</td>
        </tr>
    `).join('');
            
    document.getElementById('tabla-body').innerHTML = filasHTML;
}

// Evento para aplicar el filtro cuando se presiona el botón
document.getElementById('boton-filtrar').addEventListener('click', aplicarFiltros);

    
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
            setTimeout(function() {
                ventanaImpr.close(); // Cierra la pestaña después de imprimir
            }, 500);
        }, 500);
}

async function addUser(token) {   
    const userData = {
        pin: token,
        idNo: token
    };

    try {
        let response = await fetch(urlAddUser, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Asegúrate de que la respuesta sea JSON, si lo es usa response.json() en vez de response.text()
        let result = await response.text();  // Usamos text() si la respuesta es texto
        console.log('Respuesta de addUser:', result);
    } catch (error) {
        console.error('Error al agregar usuario:', error);
    }
}

// Función para asignar niveles de acceso al usuario
async function addUserAccessLevel(token) {
    const accessData = {
        pin: token
    };

    try {
        let response = await fetch(urlLevelUser, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accessData)
        });

        // Asegúrate de que la respuesta sea JSON, si lo es usa response.json() en vez de response.text()
        let result = await response.text();  // Usamos text() si la respuesta es texto
        console.log('Respuesta de addLevelUser:', result);
    } catch (error) {
        console.error('Error al asignar niveles de acceso:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('boton-filtrar').addEventListener('click', aplicarFiltros);
    
    // Opcional: filtrado automático al escribir
    document.getElementById('buscador-codigo').addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
});
