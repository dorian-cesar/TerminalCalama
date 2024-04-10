const formulario = document.getElementById('formulario');

const urlLoad = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Boleta/load.php';
const urlUpdate = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Boleta/save.php';

// Estado botones
const urlStore = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/store.php';
const urlState = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/reload.php';

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const qrTxt = atob(formulario.QRIn.value);

    const qrIn = qrTxt.split('/');

    const idIn = qrIn[0];
    const casIn = qrIn[1];

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
        const valorTotal = (horasOc*valorHora);
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
            <td style="text-align:right">$${valorTotal}</td>
        </tr>
        `
        document.getElementById('tabla-body').innerHTML = filasHTML;

        datos = {
            id: idIn,
            estado: "Entregado",
            hora: horaStr,
            fecha: fechaStr,
            valor: valorTotal,
        };

        // Actualizamos el registro como salida
        // Esto deberia hacerse en otro momento, queda aqui para
        // motivos de prueba y demostracion 
        //console.log(datos);
        callAPI(datos, urlUpdate)
        .then(result => {
            console.log("Registro actualizado correctamente.");
            cargarEstado(casIn);
            alert("El ticket ha sido escaneado exitosamente!");
        })
    })
    .catch(err => {
        console.log(err);
        alert("El ticket ya ha sido escaneado anteriormente!");
    });
});

// Desbloquea el casillero pistoleado
async function cargarEstado(casilla) {
    let estados = await fetch(urlState)
    .then(response => response.json())
    .then(data => {
        est = JSON.parse(data.map(item => item.estado)[0]);

        // Generamos un index con la posicion de la casilla en el
        // array de casilleros bloqueados
        const indx = est.indexOf(casilla);

        // Si se encuentra, lo quitamos
        if(indx > -1){
            est.splice(indx,1);
        }

        // Generamos los datos para actualizar los casilleros bloqueados
        const dateAct = new Date();
        const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+';'+dateAct.getSeconds();
        const fechaStr = dateAct.toISOString().split('T')[0];
    
        const datos = {
            estado: JSON.stringify(est),
            hora: horaStr,
            fecha: fechaStr,
        }
    
        // Guardamos la nueva lista de casilleros bloqueados
        callAPI(datos, urlStore);
    })
    .catch(error => {
        console.error('Error al obtener datos: ', error);
    });
    return estados;
}

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

function printBol() {
    const ventanaImpr = window.open('', '_blank');

    const contBoleta = document.getElementById('boletaCont');

    // Obtenemos la fecha actual
    const dateAct = new Date();
    // Separamos hora y fecha en constantes unicas
    const horaStr = dateAct.getHours()+':'+dateAct.getMinutes()+':'+dateAct.getSeconds();
    const fechaStr = dateAct.toISOString().split('T')[0];

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title></head><body style="text-align:center; width: max-content;">');
    ventanaImpr.document.write('<h1>Ticket de Entrega</h1>');
    ventanaImpr.document.write(`<h3>${fechaStr} ${horaStr}</h3>`);
    ventanaImpr.document.write(contBoleta.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();

    ventanaImpr.print();
}