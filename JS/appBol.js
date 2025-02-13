const formulario = document.getElementById('formulario');

const urlLoad = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Boleta/load.php';
const urlUpdate = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Boleta/save.php';

// Estado botones
const urlStore = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/store.php';
const urlState = 'https://masgps-bi.wit.la/TerminalCalama/PHP/Custodia/reload.php';

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtenemos el código de barras escaneado
    const barcodeTxt = formulario.barcodeIn.value;

    // Separar ID y casillero (formato esperado: idcustodia-casillero)
    const barcodeData = barcodeTxt.split('/');

    if (barcodeData.length !== 3) {
        alert("Código de barras inválido.");
        return;
    }

    const idIn = barcodeData[0]; // ID de custodia
    const casIn = barcodeData[1]; // Casillero
    const rutIn = barcodeData[2]; // Rut

    // Obtenemos la fecha actual
    const dateAct = new Date();
    const horaStr = dateAct.getHours() + ':' + dateAct.getMinutes() + ':' + dateAct.getSeconds();
    const fechaStr = dateAct.toISOString().split('T')[0];

    // Recuperamos el valor del bulto desde localStorage
    const bultoStr = localStorage.getItem('bultoSeleccionado');
    let valorHora = 1000; // Valor por hora por defecto

    if (bultoStr) {
        // Usamos la función getValorBulto para obtener el valor según el bulto seleccionado
        valorHora = getValorBulto(bultoStr);
    }

    traerDatos(idIn)
        .then(result => {
            if (!result || !result.fecha || !result.hora) {
                alert("Error: No se encontró la información del ticket.");
                return;
            }

            const dateOld = new Date(result.fecha + 'T' + result.hora);
            const diffTime = Math.abs(dateAct - dateOld); // Diferencia total en milisegundos
            const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Convertir a días completos

            let valorTotal = diffDays * valorHora;

            // Recuperamos la fecha de creación del ticket desde localStorage
            const fechaCreacion = localStorage.getItem('fechaCreacion');
            let acumulado = 0;

            if (fechaCreacion) {
                const lastTime = new Date(fechaCreacion);
                const diff = Math.abs(dateAct - lastTime); // Diferencia total en milisegundos
                const diffHoras = diff / 36e5; // Convertir la diferencia en horas
                const ciclos24 = Math.floor(diffHoras / 24); // Número de ciclos de 24 horas transcurridos

                // Calculamos el valor acumulado, sumando el valor cada ciclo de 24 horas
                acumulado = ciclos24 * valorHora + valorTotal;
            } else {
                // Si no existe la fecha de creación, guardamos la fecha actual como fecha de inicio
                localStorage.setItem('fechaCreacion', dateAct.toISOString());
                acumulado = valorTotal; // Usamos el valor total si es el primer escaneo
            }

            // Guardamos el valor acumulado y la última hora de pago
            localStorage.setItem('valorAcumulado', acumulado.toFixed(2));
            localStorage.setItem('ultimoPago', dateAct.toISOString());

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
                    <td style="text-align:right">${diffDays} Días</td>
                </tr>
                <tr>
                    <td>Valor por Dia</td>
                    <td style="text-align:right">$${valorHora}</td>
                </tr>
                <tr>
                    <td>Valor Total</td>
                    <td style="text-align:right">$${Math.round(acumulado)}</td>
                </tr>
            `;
            document.getElementById('tabla-body').innerHTML = filasHTML;

            const datos = {
                id: idIn,
                estado: "Entregado",
                hora: horaStr,
                fecha: fechaStr,
                valor: acumulado,
                rut: rutIn, // Incluir el RUT
            };

            callAPI(datos, urlUpdate)
                .then(result => {
                    console.log("Registro actualizado correctamente.");
                    cargarEstado(casIn);
                    alert("El ticket ha sido escaneado exitosamente!");
                });

        })
        .catch(err => {
            console.log(err);
            alert("El ticket ya ha sido escaneado anteriormente o es inválido.");
        });
});


// Desbloquea el casillero escaneado
async function cargarEstado(casilla) {
    let estados = await fetch(urlState)
        .then(response => response.json())
        .then(data => {
            est = JSON.parse(data.map(item => item.estado)[0]);

            // Removemos la casilla escaneada de la lista de bloqueadas
            const indx = est.indexOf(casilla);
            if (indx > -1) {
                est.splice(indx, 1);
            }

            const dateAct = new Date();
            const horaStr = dateAct.getHours() + ':' + dateAct.getMinutes() + ';' + dateAct.getSeconds();
            const fechaStr = dateAct.toISOString().split('T')[0];

            const datos = {
                estado: JSON.stringify(est),
                hora: horaStr,
                fecha: fechaStr,
            };

            // Guardamos la nueva lista de casilleros bloqueados
            callAPI(datos, urlStore);
        })
        .catch(error => {
            console.error('Error al obtener datos: ', error);
        });
    return estados;
}

// Obtener datos de la boleta desde la API
async function traerDatos(id) {
    let datos = await fetch(urlLoad, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(id)
        })
        .then(response => response.json())
        .then(result => {
            return result;
        })
        .catch(error => {
            console.error('Error obteniendo datos: ', error);
        });
    return datos;
}

// Llamar a la API para guardar datos
async function callAPI(datos, url) {
    let id = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Respuesta del servidor: ', result);
            return result;
        })
        .catch(error => {
            console.error('Error al enviar la solicitud: ', error);
        });
    return id;
}

function printBol() {
    const ventanaImpr = window.open('', '_blank');
    const contBoleta = document.getElementById('boletaCont');    
    
    const valor = parseFloat(localStorage.getItem('valorAcumulado')); // Se obtiene el valor acumulado

    let servicio = "Custodia"; 

    // Verificamos si hay un valor válido
    if (!valor) {
        console.error("El valor no fue encontrado para el servicio:", servicio);
        return;
    }

    // Creamos el payload para enviar a la API
    let payload = {
        "codigoEmpresa": "89",
        "tipoDocumento": "39",
        "total": valor,
        "detalleBoleta": `53-${valor}-1-dsa-${servicio}`
    };

    console.log("Payload preparado para el envío:", payload);

    // Realizamos la solicitud AJAX para generar la boleta en PDF
    $.ajax({
        url: "https://qa.pullman.cl/srv-dte-web/rest/emisionDocumentoElectronico/generarDocumento",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        beforeSend: function () {
            console.log("Iniciando conexión con el servidor...");
        },
        success: function (response) {
            try {
                console.log("Respuesta recibida:", response);

                if (response.respuesta === "OK") {
                    // Recibimos la URL del PDF
                    let pdfUrl = response.rutaAcepta;

                    // Obtener la fecha y hora actuales
                    const dateAct = new Date();
                    const horaStr = dateAct.getHours() + ':' + dateAct.getMinutes() + ':' + dateAct.getSeconds();
                    const fechaStr = dateAct.toISOString().split('T')[0];

                    // Mostrar la boleta en la ventana de impresión
                    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title></head><body style="text-align:center; width: max-content;">');
                    ventanaImpr.document.write('<h1>Ticket de Entrega</h1>');
                    ventanaImpr.document.write(`<h3>${fechaStr} ${horaStr}</h3>`);
                    ventanaImpr.document.write(contBoleta.innerHTML);
                    ventanaImpr.document.write(`<p>Boleta generada con éxito. <a href="${pdfUrl}" target="_blank">Ver PDF</a></p>`);
                    ventanaImpr.document.write('</body></html>');

                    ventanaImpr.document.close();
                    ventanaImpr.print();
                    ventanaImpr.close();
                } else {
                    console.error("Error al generar la boleta:", response);
                    ventanaImpr.document.write("<p>Error al generar la boleta.</p>");
                }
            } catch (error) {
                console.error("Error al procesar la respuesta:", error);
                ventanaImpr.document.write("<p>Error inesperado. Consulte la consola para más detalles.</p>");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud AJAX:", textStatus, errorThrown);
            ventanaImpr.document.write("<p>Error en la comunicación con el servidor.</p>");
        },
        complete: function () {
            console.log("Conexión con el servidor finalizada.");
        }
    });
}
