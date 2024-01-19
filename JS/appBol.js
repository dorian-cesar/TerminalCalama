const formulario = document.getElementById('formulario');

const urlLoad = 'http://localhost/TerminalCalama/PHP/Boleta/load.php';

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const qrTxt = atob(formulario.QRIn.value);

    const qrIn = qrTxt.split('/');

    const idIn = qrIn[0];

    // Obtenemos la fecha actual
    const dateAct = new Date();
    // Separamos hora y fecha en constantes unicas
    const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+':'+dateAct.getSeconds();
    const fechaStr = dateAct.toISOString().split('T')[0];

    const valorHora = 1000;

    traerDatos(idIn)
    .then(result => {
        const dateOld = new Date(result.fecha+'T'+result.hora);
        const horasOc = Math.ceil(Math.abs(dateAct - dateOld) / 36e5);
        const filasHTML = `
        <tr>
            <td>Casillero</td>
            <td style="text-align:right">${result.posicion}</td>
        </tr>
        <tr>
            <td>Fecha de Entrada</td>
            <td style="text-align:right">${result.fecha} ${result.hora}</td>
        </tr>
        <tr>
            <td>Fecha de Salida</td>
            <td style="text-align:right">${fechaStr} ${horaStr}</td>
        </tr>
        <tr>
            <td>Tiempo Ocupado</td>
            <td style="text-align:right">${horasOc} Hrs.</td>
        </tr>
        <tr>
            <td>Valor por Hora</td>
            <td style="text-align:right">$${valorHora}</td>
        </tr>
        <tr>
            <td>Valor a Pagar</td>
            <td style="text-align:right">$${horasOc*valorHora}</td>
        </tr>
        `
        document.getElementById('tabla-body').innerHTML = filasHTML;
    });
});

async function traerDatos(id) {
    let datos = await fetch(urlLoad, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(id)
            })
            .then(response => response.json())
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error('Error obteniendo datos: ', error);
            })
    return datos;
}