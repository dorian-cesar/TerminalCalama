// Inicializar contenedores de código de barras y formulario
const contBarcode = document.getElementById('contBarcode');
const formulario = document.getElementById('formulario');

JsBarcode("#barcode", "wit.la", {
    format: "CODE128",
    displayValue: true,
    width: 2,      // Ajusta el ancho de las barras
    height: 50,    // Ajusta la altura del código de barras
    margin: 10     // Espacio alrededor del código de barras
});


// Generar matriz de casilleros
const matCont = document.getElementById('matriz');
const matX = 8;
const matY = 6;

for (let i = 0; i < matY; i++) {
    for (let j = 0; j < matX; j++) {
        const letra = getLetterFromNumber(j);
        const btn = document.createElement('button');
        btn.className = 'casilla';
        btn.id = 'lockerbtn' + i + letra;
        btn.textContent = `${i},${letra}`;
        btn.addEventListener('click', () => toggleButton(btn));
        matCont.appendChild(btn);
    }
    matCont.appendChild(document.createElement('br'));
}

function getLetterFromNumber(num) {
    if (num > 25) { num += 6; }
    return String.fromCharCode(65 + num);
}

// Punteros a APIs PHP
const urlSave = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/save.php';
const urlLoad = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/load.php';
const urlStore = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/store.php';
const urlState = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/reload.php';

actualizarTabla();
cargarEstado();

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const casillaStr = formulario.casillero.value;
    const rutStr = formulario.rut.value;

    if (casillaStr && rutStr) {
        const bultoStr = document.getElementById('bulto').value;
        if (bultoStr == 0) {
            alert('Seleccione un tamaño para el bulto');
            return;
        }

        // Guardar el valor del bulto en localStorage
        localStorage.setItem('bultoSeleccionado', bultoStr);

        const dateAct = new Date();
        const horaStr = dateAct.getHours() + ':' + dateAct.getMinutes() + ':' + dateAct.getSeconds();
        const fechaStr = dateAct.toISOString().split('T')[0];

        formulario.generar.disabled = true;
        formulario.generar.classList.add('disabled');

        const datos = {
            hora: horaStr,
            fecha: fechaStr,
            casilla: casillaStr,
            rut: rutStr,
            bulto: bultoStr,
            tipo: 'Ingresado',
        };

        callAPI(datos, urlSave)
        .then(result => {
            const barcodeData = `${result}/${casillaStr}/${rutStr}`;
            console.log(barcodeData);
            navigator.clipboard.writeText(barcodeData);

            contBarcode.innerHTML = `<svg id="barcode"></svg>`;
            JsBarcode("#barcode", barcodeData, {
                format: "CODE128",
                displayValue: true
            });

            actualizarTabla();
            formulario.casillero.value = '';
            guardarEstado();

            formulario.generar.disabled = false;
            formulario.generar.classList.remove('disabled');
        });
    } else {
        alert('Seleccione casilla e ingrese RUT');
    }
});

// Llenar las opciones del select con los valores de valores.js
const selectBulto = document.getElementById('bulto');

// Limpiar las opciones anteriores
selectBulto.innerHTML = '<option value="0" class="select-items selectClass">Seleccione</option>';

// Agregar las opciones de tamaño directamente desde el objeto valoresBulto
for (const [tamaño, valor] of Object.entries(valoresBulto)) {
    const option = document.createElement('option');
    option.value = tamaño;
    option.classList.add('select-items', 'selectClass');
    option.textContent = `Talla ${tamaño} ($${valor.toLocaleString()})`; // Agregar texto con valor formateado
    selectBulto.appendChild(option);
}



// Llamamos a la API de manera asincrona para guardar datos y retornar
// la ultima ID registrada
async function callAPI(datos, url) {
    let id = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type' : 'application/json'
        },
        // Convertimos la entrada a JSON
        body: JSON.stringify(datos)
    })
    // Obtenemos la respuesta en JSON
    .then(response => response.json())
    .then(result => {
        // Retornamos los datos obtenidos del servidor
        console.log('Respuesta del servidor: ', result);
        return result;
    })
    .catch(error => {
        console.error('Error al enviar la solicitud: ', error);
    })
    // Retornar ultima ID ingresada
    return id;
}

// Extraemos el historial y generamos una tabla
function actualizarTabla() {
    fetch(urlLoad)
    .then(response => response.json())
    .then(data => {
		const filasHTML = data.map(item =>
            `
			<tr>
				<td>${item.idcustodia}</td>
				<td>${item.posicion}</td>
				<td>${item.rut}</td>
				<td>${item.fecha} ${item.hora}</td>
				<td>${item.fechasal != '0000-00-00' ? item.fechasal : ''} ${item.horasal != '00:00:00' ? item.horasal : ''}</td>
				<td>${item.talla}</td>
				<td>${item.tipo}</td>
				<td>${item.valor > 0 ? item.valor : ''}</td>
			</tr>
		`).join('');

        //console.log(JSON.stringify(data));

		document.getElementById('tabla-body').innerHTML = filasHTML;
    })
    .catch(error => {
        console.error('Error obteniendo datos: ', error);
    })
}

// Maneja el comportamiento de las casillas
function toggleButton(btn) {
    //Obtenemos todas las casillas
    const btns = document.querySelectorAll('.casilla');

    btns.forEach(bt => {
        // Recorremos cada casilla y limpiamos el estado activo
        // para que solo se pueda seleccionar una
        if(bt.classList.contains('active')){
            bt.classList.remove('active');
        }
    })

    // Si la casilla está deshabilitada, preguntamos si la queremos rehabilitar
    if(!btn.classList.contains('disabled')){
        // De lo contrario, seleccionamos una casilla como activa
        btn.classList.toggle('active');

        if(btn.classList.contains('active')){
            formulario.casillero.value = btn.textContent;
        } else {
            formulario.casillero.value = '';
        }
    } else {
        formulario.casillero.value = '';
    }
}

// Cargamos el estado de las casillas
function cargarEstado(){
    fetch(urlState)
    .then(response => response.json())
    .then(data => {
        const est = JSON.parse(data.map(item => item.estado)[0]);

        // Limpiamos el input de casillero
        formulario.casillero.value = '';

        // Recorremos cada casilla
        est.forEach(estado => {
            // Obtenemos la casilla con el ID lockerbtn{Num}{Letra}
            const btn = document.getElementById('lockerbtn'+estado.replace(',',''));

            // Añadimos el estado disabled y removemos el active
            // para evitar seleccionar una casilla deshabilitada antes
            // de que cargue el estado
            btn.classList.add('disabled');
            btn.classList.remove('active');
        });
    })
    .catch(error => {
        console.error('Error al obtener datos: ', error);
    });
}


// Guardamos el estado de las casillas
function guardarEstado(){
    // Creamos un array para guardar las casillas deshabilitadas
    estadoObj = [];
    const btns = document.querySelectorAll('.casilla');

    // Recorremos todas las casillas
    btns.forEach(btn => {
        // Si la casilla está activa o deshabilitada, guardamos la posicion
        // en el array
        if(btn.classList.contains('active')||btn.classList.contains('disabled')){
            estadoObj.push(btn.textContent);
        }
        // Y si la casilla está solo activa, cambiamos su estado
        if(btn.classList.contains('active')){
            btn.classList.add('disabled');
            btn.classList.remove('active');
        }
    });

    const dateAct = new Date();
    const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+';'+dateAct.getSeconds();
    const fechaStr = dateAct.toISOString().split('T')[0];

    const datos = {
        estado: JSON.stringify(estadoObj),
        hora: horaStr,
        fecha: fechaStr,
    }

    callAPI(datos, urlStore);
}

function reactivarBoton(btn){
	// Esta función deberá ser modificada para traer datos desde el lector de QR
	// La siguiente implementación es solo para efectos demostrativos
	// Generamos un nuevo Date() para obtener la fecha y hora al momento de hacer Click
	const fechaHoraAct = new Date();
	
	const horaStr = fechaHoraAct.getHours() + ":" + fechaHoraAct.getMinutes() + ":" + fechaHoraAct.getSeconds()
	const fechaStr = fechaHoraAct.toISOString().split('T')[0];

	const posStr = btn.textContent;

	const datos = {
	hora: horaStr, // Traer desde la pistola
	fecha: fechaStr, // Traer desde la pistola
	casilla: posStr, // Traer desde la pistola
	rut: "-", // Traer desde la pistola
	bulto: "-", // Traer desde la pistola
	tipo: "Entregado",
	}

    callAPI(datos, urlSave)
    .then(result => {
        actualizarTabla();
        guardarEstado();
    });
}

function printBarcode() {
    const ventanaImpr = window.open('', '_blank');
    const contBarcode = document.getElementById('contBarcode'); // Me aseguro de que este elemento esté definido

    if (!contBarcode) {
        console.error("El elemento contBarcode no fue encontrado.");
        return;
    }

    const dateAct = new Date();
    const horaStr = dateAct.getHours().toString().padStart(2, '0') + ':' + 
                    dateAct.getMinutes().toString().padStart(2, '0') + ':' + 
                    dateAct.getSeconds().toString().padStart(2, '0');
    const fechaStr = dateAct.toISOString().split('T')[0];

    ventanaImpr.document.write(`
        <html>
            <head><title>Imprimir Código de Barras</title></head>
            <body style="text-align:center; width: min-content;">
                <h1>Ticket de Recepción</h1>
                <h3>${fechaStr} ${horaStr}</h3>
                ${contBarcode.innerHTML}
            </body>
        </html>
    `);

    ventanaImpr.document.close();
    ventanaImpr.print();

    // Esperar un poco para asegurarse de que el documento termine de imprimirse antes de cerrar
    setTimeout(() => {
        ventanaImpr.close();
    }, 500); // 500 ms de retraso para asegurar el cierre después de la impresión
}

