const contenedorQR = document.getElementById('contenedorQR');
const formulario = document.getElementById('formulario');

const urlServer = 'https://andenes.terminal-calama.com'

const urlSave = 'TerminalCalama/PHP/Custodia/save.php';
const urlLoad = 'TerminalCalama/PHP/Custodia/load.php';
const urlCasilla = 'TerminalCalama/PHP/Custodia/getCasillas.php'

leerDatosServer();

const QR = new QRCode(contenedorQR);
QR.makeCode('Wit.la');

formulario.addEventListener('submit', (e) => {
	e.preventDefault();

	//Solo generar el QR si ambos valores existen
	if(formulario.link.value && formulario.link2.value){
		// Validar formato de RUT XXXXXXXX-X
		const rutStr = formulario.link2.value;
		if(!/^[0-9]+-[0-9kK]{1}$/.test(rutStr)) {
			alert("Debe ingresar RUT sin puntos y con guión.");
			return;
		}
		// Generamos un nuevo Date() para obtener la fecha y hora al momento de hacer Click
		const fechaHoraAct = new Date();
	
		const horaStr = fechaHoraAct.getHours() + ":" + fechaHoraAct.getMinutes() + ":" + fechaHoraAct.getSeconds()
		const fechaStr = fechaHoraAct.toISOString().split('T')[0];

		const posStr = formulario.link.value;

		// Obtener tamaño
		const tamStr = document.getElementById('talla').value;
		const tamtxt =document.getElementById('talla').value;
		//validar tamaño 
		if (tamtxt==0){
			alert("Debe Seleccionar el tamaño");

		} else {
			const datos = {
			hora: horaStr,
			fecha: fechaStr,
			posicion: posStr,
			rut: rutStr,
			tamano: tamStr,
			tipo: "Ingresado",
			}

			// Funcion asincronica, esperará hasta que se complete la llamada API
			// para generar QR y actualizar el historial
			callApi(datos,urlServer + urlSave).then(result => {
				// Formato QR: ID/Casillero/Rut/Talla/AAAA-MM-DD/HH-MM-SS
				QR.makeCode(result+'/'+formulario.link.value+'/'+rutStr+'/'+tamStr+'/'+fechaStr+'/'+horaStr);
				// Actualizar historial
				leerDatosServer();
				// Limpiar el contenedor de casillero para evitar doble entrada
				formulario.link.value = "";
			});

			

			// Guardar estado de los botones
			guardarEstado();
		}
	} else {
		alert("Debe ingresar RUT y seleccionar Casillero.")
	}
});

function enviarReactivacion(boton){
	// Esta función deberá ser modificada para traer datos desde el lector de QR
	// La siguiente implementación es solo para efectos demostrativos
	// Generamos un nuevo Date() para obtener la fecha y hora al momento de hacer Click
	const fechaHoraAct = new Date();
	
	const horaStr = fechaHoraAct.getHours() + ":" + fechaHoraAct.getMinutes() + ":" + fechaHoraAct.getSeconds()
	const fechaStr = fechaHoraAct.toISOString().split('T')[0];

	const posStr = boton.textContent;

	const datos = {
	hora: horaStr, // Traer desde la pistola
	fecha: fechaStr, // Traer desde la pistola
	posicion: posStr, // Traer desde la pistola
	rut: "-", // Traer desde la pistola
	tamano: "-", // Traer desde la pistola
	tipo: "Entregado",
	}
	callApi(datos, urlServer + urlSave);
	setTimeout(() => {
		leerDatosServer()
	}, 3000);
}


function leerDatosServer() {
	fetch(urlServer + urlLoad)
	.then(response => response.json())
	.then(data => {
		const filasHTML = data.map(item => `
			<tr>
				<td>${item.idcustodia}</td>
				<td>${item.posicion}</td>
				<td>${item.rut}</td>
				<td>${item.hora}</td>
				<td>${item.fecha}</td>
				<td>${item.talla}</td>
				<td>${item.tipo}</td>
			</tr>
		`).join('');

		document.getElementById('tabla-body').innerHTML = filasHTML;
	})
	.catch(error => {
		console.error('Error al obtener datos: ', error);
	});
}


document.addEventListener("DOMContentLoaded", function() {
    cargarEstadoCasilleros();
});

function cargarEstadoCasilleros() {
    fetch(urlServer + urlCasilla)  // Usando la URL que ya tienes definida
        .then(response => response.json())
        .then(data => {
            data.forEach((estado, index) => {  // Recorre el array de estados
                const casillero = document.getElementById(`casillero-${index + 1}`);  // Suponiendo que los botones son #casillero-1, #casillero-2, etc.
                if (estado === "ocupado") {
                    casillero.disabled = true;  // Deshabilita el casillero
                    casillero.classList.add("ocupado");  // Clase para estilo visual
                } else {
                    casillero.disabled = false;
                    casillero.classList.remove("ocupado");
                }
            });
        })
        .catch(error => console.error("Error al cargar el estado de los casilleros:", error));
}

