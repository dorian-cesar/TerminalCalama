const contenedorQR = document.getElementById('contenedorQR');
const formulario = document.getElementById('formulario');

const urlSave = 'http://localhost/TerminalCalama/custsave.php';
const urlLoad = 'http://localhost/TerminalCalama/custload.php';
const urlStore = 'http://localhost/TerminalCalama/custstore.php';

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
			tipo: "Entrada",
			}
			callApi(datos, urlSave);
			leerDatosServer();
			QR.makeCode(formulario.link.value+'/'+rutStr+'/'+fechaStr+'/'+horaStr);

			formulario.link.value = "";
			// Guardar estado de los botones
			guardarEstado();
		}
	} else {
		alert("Debe ingresar RUT y seleccionar Casillero.")
	}
});

function guardarEstado(){
	estadoStr = "";
	const botones = document.querySelectorAll('.btn');

	botones.forEach(btn => {
		act = false;
		if(btn.classList.contains('active')||btn.classList.contains('disabled')){
			act = true;
			estadoStr += btn.textContent + "|";
		}
		if(btn.classList.contains('active')){
			btn.classList.add('disabled');
			btn.classList.remove('active');
			//btn.disabled = true;
		}
	});

	const fechaHoraAct = new Date();
	
	const horaStr = fechaHoraAct.getHours() + ":" + fechaHoraAct.getMinutes() + ":" + fechaHoraAct.getSeconds()
	const fechaStr = fechaHoraAct.toISOString().split('T')[0];

	const datos = {
	estado: estadoStr,
	hora: horaStr,
	fecha: fechaStr,
	}

	callApi(datos, urlStore);
	localStorage.setItem('estadoBotones', JSON.stringify(estadoStr));
}

function callApi (datos, url){ // Insertar los datos mediante llamada PHP usando JSON
	fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(datos)
	})
	.then(response => {
		if(!response.ok){
			throw new Error('Error en la solicitud');
		}
	})
	.then(result => {
		console.log('Respuesta del servidor: ', result);
	})
	.catch(error => {
		console.error('Error al enviar la solicitud: ', error);
	})
}

function leerDatosServer() {
	fetch(urlLoad)
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