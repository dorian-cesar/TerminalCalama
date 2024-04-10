// Inicializar contenedores QR y formulario
const contQR = document.getElementById('contQR');
const formulario = document.getElementById('formulario');

// Generar QR por defecto
const QR = new QRCode(contQR);
QR.makeCode('wit.la');

// Generar matriz de casilleros
const matCont = document.getElementById('matriz');

const matX = 8;
const matY = 6;

// Generamos los botones de casilleros
for(let i = 0; i < matY; i++){
    for(let j = 0; j < matX; j++){
        // Obtenemos una letra basada en un numero A-Z-a-z
        const letra = getLetterFromNumber(j);

        // Creamos un nuevo boton
        const btn = document.createElement('button');

        // Clase: casilla, id: lockerbtn{Num}{Letra}, texto: {Num},{Letra}
        btn.className = 'casilla';
        btn.id = 'lockerbtn'+i+letra;
        btn.textContent = `${i},${letra}`;
        // Asignamos una función al hacer Click
        btn.addEventListener('click', () => toggleButton(btn));
        // Agregamos el boton a la matriz
        matCont.appendChild(btn);
    }
    // Saltamos a la proxima linea
    matCont.appendChild(document.createElement('br'));
}

// Convierte numeros a letras A-Z
function getLetterFromNumber(num) {
    if (num > 25) { num+=6; }
    return String.fromCharCode(65+num);
}

// Punteros a APIs PHP
//const urlSave = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/save.php';
//const urlLoad = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/load.php';
//const urlStore = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/store.php';
//const urlState = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/reload.php';

const urlSave = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/save.php';
const urlLoad = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/load.php';
const urlStore = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/store.php';
const urlState = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/reload.php';

actualizarTabla();
cargarEstado();

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtenemos Casilla y RUT
    const casillaStr = formulario.casillero.value;
    const rutStr = formulario.rut.value;

    // Validar Casilla y RUT
    if(casillaStr && rutStr){
        // Obtenemos el tamaño del bulto
        const bultoStr = document.getElementById('bulto').value;

        // Validamos que el tamaño sea valido
        if(bultoStr==0){
            alert('Seleccione un tamaño para el bulto');
            return;
        }

        // Validamos el RUT mediante RegEx
        if(!/^[0-9]+-[0-9kK]{1}$/.test(rutStr)){
            alert('Ingrese un RUT válido');
            return;
        }

        // Obtenemos la fecha actual
        const dateAct = new Date();
        // Separamos hora y fecha en constantes unicas
        const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+':'+dateAct.getSeconds();
        const fechaStr = dateAct.toISOString().split('T')[0];

        // Desactivamos el boton de generar QR
        formulario.generar.disabled = true;
        formulario.generar.classList.add('disabled');

        // Añadimos los datos para enviar a la API
        const datos = {
            hora: horaStr,
            fecha: fechaStr,
            casilla: casillaStr,
            rut: rutStr,
            bulto: bultoStr,
            tipo: 'Ingresado',
        }

        // Llamamos a la API para guardar un registro de entrada
        callAPI(datos, urlSave)
        // Lo siguiente solo se ejecutará cuando la API entregue una respuesta
        .then(result => {
            // Generamos un QR con los datos de ingreso
            const qrConv = btoa(result+'/'+casillaStr+'/'+rutStr+'/'+bultoStr+'/'+fechaStr+'/'+horaStr);
            console.log(qrConv);
            navigator.clipboard.writeText(qrConv);
            QR.makeCode(qrConv);
            actualizarTabla();
            // Limpiamos la entrada de casilla para evitar doble envio
            formulario.casillero.value = '';
            guardarEstado();
            // Rehabilitamos el boton de Generar QR
            formulario.generar.disabled = false;
            formulario.generar.classList.remove('disabled');
        });
    } else {
        alert('Seleccione casilla e ingrese RUT');
    }
});

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

function printQR() {
    const ventanaImpr = window.open('', '_blank');

    // Obtenemos la fecha actual
    const dateAct = new Date();
    // Separamos hora y fecha en constantes unicas
    const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+':'+dateAct.getSeconds();
    const fechaStr = dateAct.toISOString().split('T')[0];

    ventanaImpr.document.write('<html><head><title>Imprimir QR</title></head><body style="text-align:center; width: min-content;">');
    ventanaImpr.document.write('<h1>Ticket de Recepción</h1>');
    ventanaImpr.document.write(`<h3>${fechaStr} ${horaStr}</h3>`);
    ventanaImpr.document.write(contQR.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();

    ventanaImpr.print();
}