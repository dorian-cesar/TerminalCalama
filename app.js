const contenedorQR = document.getElementById('contenedorQR');
const formulario = document.getElementById('formulario');

let contador = 0;

const fechaHoraActual = new Date();
const fechaActual = fechaHoraActual.toISOString().split('T')[0];
const horaActual = fechaHoraActual.toLocaleTimeString();

const QR = new QRCode(contenedorQR);
QR.makeCode('Wit.la');



formulario.addEventListener('submit', (e) => {
	e.preventDefault();
	contador++;
	QR.makeCode(formulario.link.value+' / '+fechaActual+' / '+ horaActual);
	console.log('Fecha actual:', fechaActual);
	console.log('Hora actual:', horaActual);
});


