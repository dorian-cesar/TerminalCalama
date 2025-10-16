const contenedorQR = document.getElementById("contenedorQR");
const contenedorContador = document.getElementById("keycont");
contenedorContador.value = "Código QR";
const genQR = document.getElementById("generar");
const QR = new QRCode(contenedorQR);
QR.makeCode("wit");

//urlBase='http://localhost'
urlBase = "https://andenes.terminal-calama.com";

//const urlServer = 'http://localhost'
const urlServer = "https://andenes.terminal-calama.com";

const urlLoad = urlServer + "/TerminalCalama/PHP/Restroom/load.php";
const urlSave = urlServer + "/TerminalCalama/PHP/Restroom/save.php";
const urlAddUser = urlServer + "/TerminalCalama/PHP/Restroom/addUser.php";
const urlLevelUser =
  urlServer + "/TerminalCalama/PHP/Restroom/addLevelUser.php";
const urlBoleto = urlServer + "/TerminalCalama/PHP/Restroom/estadoBoleto.php";

console.log(urlBase);

leerDatosServer();

//const fechaHoraActual = new Date();
//const fechaActual = fechaHoraActual.toISOString().split('T')[0];
//const horaActual = fechaHoraActual.toLocaleTimeString();

var numero = 0;
genQR.addEventListener("click", (e) => {
  e.preventDefault();

  // Validación de id_caja en localStorage
  const id_caja = localStorage.getItem("id_caja");
  if (!id_caja) {
    alert("Por favor, primero debe abrir la caja antes de generar un QR.");
    return; // Detiene la ejecución si no hay id_caja
  }

  genQR.disabled = true;
  genQR.classList.add("disabled");

  // Generamos un nuevo Date() para obtener la fecha y hora al momento de hacer Click
  const fechaHoraAct = new Date();

  const horaStr =
    fechaHoraAct.getHours() +
    ":" +
    fechaHoraAct.getMinutes() +
    ":" +
    fechaHoraAct.getSeconds();
  const fechaStr = fechaHoraAct.toISOString().split("T")[0];
  const tipoStr = document.querySelector('input[name="tipo"]:checked').value;

  const numeroT = generarTokenNumerico();
  const datos = {
    Codigo: numeroT,
    hora: horaStr,
    fecha: fechaStr,
    tipo: tipoStr,
    valor: restroom[tipoStr] || 0,
    id_caja: id_caja,
  };

  callApi(datos)
    .then((res) => {
      QR.makeCode(numeroT);
      contenedorContador.value = numeroT;
      leerDatosServer();
      genQR.disabled = false;
      genQR.classList.remove("disabled");
      addUser(numeroT);

      setTimeout(() => {
        let name = numeroT.substring(0, 6);
        console.log(name);
        addUserAccessLevel(name);
      }, 1000);
    })
    .catch((error) => {
      console.error("Error al generar QR:", error);
      genQR.disabled = false;
      genQR.classList.remove("disabled");
      alert(
        "Ocurrió un error al generar el QR. Por favor, intente nuevamente."
      );
    });
});

function escribirTexto() {
  contenedorContador.innerHTML = "texto";
}

async function callApi(datos) {
  let ret = await fetch(urlSave, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  })
    .then((response) => {
      // Verificar la respuesta del servidor
      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
      return response.text(); // Devolver la respuesta como texto
    })
    .then((result) => {
      // Manejar la respuesta del servidor
      console.log("Respuesta del servidor:", result);
    })
    .catch((error) => {
      // Capturar y manejar errores
      console.error("Error al enviar la solicitud:", error);
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
    .then((response) => response.json())
    .then((data) => {
      datosGlobales = data; // Almacenar datos globalmente
      aplicarFiltros(); // Aplicar filtros actuales
    })
    .catch((error) => {
      console.error("Error al obtener datos:", error);
    });
}

// Función para aplicar filtros
function aplicarFiltros() {
  const codigoFiltro = document
    .getElementById("buscador-codigo")
    .value.toLowerCase();
  const tipoFiltro = document.getElementById("filtro-tipo").value;
  const fechaFiltro = document.getElementById("filtro-fecha").value; // Obtener la fecha seleccionada

  const datosFiltrados = datosGlobales.filter((item) => {
    const coincideCodigo = item.Codigo.toLowerCase().includes(codigoFiltro);
    const coincideTipo = tipoFiltro === "" || item.tipo === tipoFiltro;

    // Filtrar por fecha
    const coincideFecha = fechaFiltro === "" || item.date === fechaFiltro;

    return coincideCodigo && coincideTipo && coincideFecha;
  });

  // Generar HTML para la tabla
  const filasHTML = datosFiltrados
    .map(
      (item) => `
        <tr>
            <td>${item.idrestroom}</td>
            <td>${item.Codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.date}</td>
            <td>${item.time}</td>
        </tr>
    `
    )
    .join("");

  document.getElementById("tabla-body").innerHTML = filasHTML;
}

// Evento para aplicar el filtro cuando se presiona el botón
document
  .getElementById("boton-filtrar")
  .addEventListener("click", aplicarFiltros);

function printQR() {
  const ventanaImpr = window.open("", "_blank");

  // Obtenemos la fecha y hora actual
  const dateAct = new Date();
  const horaStr =
    dateAct.getHours().toString().padStart(2, "0") +
    ":" +
    dateAct.getMinutes().toString().padStart(2, "0") +
    ":" +
    dateAct.getSeconds().toString().padStart(2, "0");
  const fechaStr = dateAct.toISOString().split("T")[0];

  // Obtener el código QR generado
  const codigoQR = document.getElementById("keycont").value;
  const tipoSeleccionado = document.querySelector(
    'input[name="tipo"]:checked'
  ).value;

  if (!codigoQR) {
    alert("No hay código QR generado para imprimir.");
    return;
  }

  // Obtener el precio desde restroom.js
  const precio =
    restroom[tipoSeleccionado] !== undefined
      ? `$${restroom[tipoSeleccionado]}`
      : "No definido";

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
                        ${document.getElementById("contenedorQR").innerHTML}
                    </div>
                </body>
            </html>
        `);
  ventanaImpr.document.close();

  setTimeout(function () {
    ventanaImpr.print();
    setTimeout(function () {
      ventanaImpr.close(); // Cierra la pestaña después de imprimir
    }, 500);
  }, 500);
}

async function addUser(token) {
  const userData = {
    pin: token,
    idNo: token,
  };

  try {
    let response = await fetch(urlAddUser, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Asegúrate de que la respuesta sea JSON, si lo es usa response.json() en vez de response.text()
    let result = await response.text(); // Usamos text() si la respuesta es texto
    console.log("Respuesta de addUser:", result);
  } catch (error) {
    console.error("Error al agregar usuario:", error);
  }
}

// Función para asignar niveles de acceso al usuario
async function addUserAccessLevel(token) {
  const accessData = {
    pin: token,
  };

  try {
    let response = await fetch(urlLevelUser, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accessData),
    });

    // Asegúrate de que la respuesta sea JSON, si lo es usa response.json() en vez de response.text()
    let result = await response.text(); // Usamos text() si la respuesta es texto
    console.log("Respuesta de addLevelUser:", result);
  } catch (error) {
    console.error("Error al asignar niveles de acceso:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("boton-filtrar")
    .addEventListener("click", aplicarFiltros);

  // Opcional: filtrado automático al escribir
  document
    .getElementById("buscador-codigo")
    .addEventListener("input", aplicarFiltros);
  document
    .getElementById("filtro-tipo")
    .addEventListener("change", aplicarFiltros);
});

function verificarCodigo() {
  const codigoInput = document.getElementById("buscador-codigo").value.trim();
  const resultadoDiv = document.getElementById("resultado-verificacion");
  const tablaResultados = document.getElementById("tabla-resultados");

  // Verificar si el código tiene al menos 6 caracteres
  if (!codigoInput || codigoInput.length < 6) {
    alert("El código debe tener al menos 6 caracteres.");
    return;
  }

  fetch(`${urlBoleto}?userPin=${encodeURIComponent(codigoInput)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status}`
        );
      }
      return response.json();
    })
    .then((data) => {
      // Limpiar tabla antes de agregar nuevos datos
      tablaResultados.innerHTML = "";

      if (data.error) {
        tablaResultados.innerHTML = `<tr><td colspan="4" style="color: red;">Error: ${data.error}</td></tr>`;
      } else {
        const mensaje = data.message || "Verificación exitosa";
        const fecha = data.eventTime || "N/A";
        const puerta = data.doorName || "N/A";

        tablaResultados.innerHTML = `
                <tr>
                    <td>${codigoInput}</td>
                    <td>${mensaje}</td>
                    <td>${fecha}</td>
                    <td>${puerta}</td>
                </tr>
            `;
      }

      // Mostrar la tabla
      resultadoDiv.style.display = "block";
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
      tablaResultados.innerHTML = `<tr><td colspan="4" style="color: red;">Hubo un problema al verificar el código.</td></tr>`;
      resultadoDiv.style.display = "block";
    });
}

// Función para cerrar la tabla
function cerrarTabla() {
  document.getElementById("resultado-verificacion").style.display = "none";
}

// Agregar evento al botón de verificación
document
  .getElementById("boton-verificar")
  .addEventListener("click", verificarCodigo);

// Agregar evento al botón de cerrar
document.getElementById("cerrar-tabla").addEventListener("click", cerrarTabla);

let datosGlobales = [];
// Función para cargar datos del servidor
async function loadServerData() {
  try {
    const response = await fetch(urlLoad);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar datos del servidor:", error);
    return [];
  }
}

// Función para actualizar estadísticas con datos del día
async function updateStats() {
  try {
    const serverData = await loadServerData();
    const today = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Filtrar transacciones del día actual
    const todayTransactions = serverData.filter((t) => t.date === today);

    // Calcular totales
    const totalAmount = todayTransactions.reduce((sum, t) => {
      const price =
        t.tipo === "Baño" ? window.restroom.Baño : window.restroom.Ducha;
      return sum + price;
    }, 0);

    const totalBanos = todayTransactions.filter(
      (t) => t.tipo === "Baño"
    ).length;
    const totalDuchas = todayTransactions.filter(
      (t) => t.tipo === "Ducha"
    ).length;

    // Actualizar la UI
    document.getElementById("totalDay").textContent = "$" + totalAmount;
    document.getElementById("totalTransactions").textContent =
      todayTransactions.length;
    document.getElementById("totalBanos").textContent = totalBanos;
    document.getElementById("totalDuchas").textContent = totalDuchas;
  } catch (error) {
    console.error("Error al actualizar estadísticas:", error);
  }
}

// Función para renderizar historial con datos del servidor
async function renderHistory() {
  try {
    const serverData = await loadServerData();
    datosGlobales = serverData; // Almacenar datos globalmente
    const tbody = document.getElementById("tabla-body");

    if (serverData.length === 0) {
      tbody.innerHTML = `
              <tr>
                <td colspan="5" style="text-align: center; color: #a3a3a3;">
                  No hay transacciones registradas
                </td>
              </tr>
            `;
      return;
    }

    tbody.innerHTML = serverData
      .map(
        (t) => `
              <tr>
                <td>${t.idrestroom}</td>
                <td><code style="color: #3b82f6;">${t.Codigo}</code></td>
                <td>${t.tipo}</td>
                <td>${t.date}</td>
                <td>${t.time}</td>
              </tr>
            `
      )
      .join("");
  } catch (error) {
    console.error("Error al renderizar historial:", error);
  }
}

// Función para aplicar filtros
function aplicarFiltros() {
  const codigoFiltro = document
    .getElementById("buscador-codigo")
    .value.toLowerCase();
  const tipoFiltro = document.getElementById("filtro-tipo").value;
  const fechaFiltro = document.getElementById("filtro-fecha").value;

  const datosFiltrados = datosGlobales.filter((item) => {
    const coincideCodigo = item.Codigo.toLowerCase().includes(codigoFiltro);
    const coincideTipo = tipoFiltro === "" || item.tipo === tipoFiltro;
    const coincideFecha = fechaFiltro === "" || item.date === fechaFiltro;

    return coincideCodigo && coincideTipo && coincideFecha;
  });

  // Generar HTML para la tabla
  const filasHTML = datosFiltrados
    .map(
      (item) => `
              <tr>
                  <td>${item.idrestroom}</td>
                  <td>${item.Codigo}</td>
                  <td>${item.tipo}</td>
                  <td>${item.date}</td>
                  <td>${item.time}</td>
              </tr>
          `
    )
    .join("");

  document.getElementById("tabla-body").innerHTML = filasHTML;
}

function verificarCodigo() {
  const codigoInput = document.getElementById("buscador-codigo").value.trim();
  const resultadoDiv = document.getElementById("resultado-verificacion");
  const tablaResultados = document.getElementById("tabla-resultados");

  if (!codigoInput || codigoInput.length < 6) {
    alert("El código debe tener al menos 6 caracteres.");
    return;
  }

  fetch(`${urlBoleto}?userPin=${encodeURIComponent(codigoInput)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status}`
        );
      }
      return response.json();
    })
    .then((data) => {
      tablaResultados.innerHTML = "";

      if (data.error) {
        tablaResultados.innerHTML = `<tr><td colspan="4" style="color: red;">Error: ${data.error}</td></tr>`;
      } else {
        const mensaje = data.message || "Verificación exitosa";
        const fecha = data.eventTime || "N/A";
        const puerta = data.doorName || "N/A";

        tablaResultados.innerHTML = `
                  <tr>
                      <td>${codigoInput}</td>
                      <td>${mensaje}</td>
                      <td>${fecha}</td>
                      <td>${puerta}</td>
                  </tr>
              `;
      }

      resultadoDiv.style.display = "block";
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
      tablaResultados.innerHTML = `<tr><td colspan="4" style="color: red;">Hubo un problema al verificar el código.</td></tr>`;
      resultadoDiv.style.display = "block";
    });
}

function cerrarTabla() {
  document.getElementById("resultado-verificacion").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  // Mostrar valores iniciales
  document.getElementById("valorBaño").textContent = `$${window.restroom.Baño}`;
  document.getElementById(
    "valorDucha"
  ).textContent = `$${window.restroom.Ducha}`;

  // Inicializar estadísticas e historial
  updateStats();
  renderHistory();

  // Configurar eventos
  document
    .getElementById("boton-filtrar")
    .addEventListener("click", aplicarFiltros);
  document
    .getElementById("buscador-codigo")
    .addEventListener("input", aplicarFiltros);
  document
    .getElementById("filtro-tipo")
    .addEventListener("change", aplicarFiltros);
  document
    .getElementById("boton-verificar")
    .addEventListener("click", verificarCodigo);
  document
    .getElementById("cerrar-tabla")
    .addEventListener("click", cerrarTabla);

  // Actualizar estadísticas cuando se genera un nuevo QR
  document.getElementById("generar").addEventListener("click", function () {
    setTimeout(() => {
      updateStats();
      renderHistory();
    }, 1000);
  });
});

// Resto del código jQuery existente para la generación de boletas
$(document).ready(function () {
  $("#entrada").click(function (event) {
    event.preventDefault();

    let servicio = $('input[name="tipo"]:checked').val();
    let valor = String(restroom[servicio]);

    console.log("Servicio seleccionado:", servicio);
    console.log("Valor asignado:", valor);

    if (!valor) {
      console.error("El valor no fue encontrado para el servicio:", servicio);
      $("#resultado").html(
        "<div class='alert alert-warning'>Tipo de servicio no válido.</div>"
      );
      return;
    }

    let payload = {
      codigoEmpresa: "89",
      tipoDocumento: "39",
      total: valor,
      detalleBoleta: `53-${valor}-1-dsa-${servicio}`,
    };

    console.log("Payload preparado para el envío:", payload);

    $("#resultado").html(
      "<div class='loading'>Generando boleta, por favor espere...</div>"
    );

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
            let boletaHtml = `
                                      <div class='alert alert-success'>
                                          <p><strong>Boleta generada con éxito.</strong></p>
                                          <p><strong>Folio:</strong> ${response.folio}</p>
                                          <p><strong>Fecha:</strong> ${response.fecha}</p>
                                      </div>
                                      <div class="mt-3">
                                          <a href='${response.rutaAcepta}' target='_blank' class='btn'>Ver Boleta</a>
                                      </div>`;
            $("#resultado").html(boletaHtml);
            console.log("Boleta generada correctamente.");
          } else {
            $("#resultado").html(
              "<div class='alert alert-danger'>Error al generar la boleta.</div>"
            );
            console.warn("Error en la respuesta del servidor:", response);
          }
        } catch (error) {
          console.error("Error al procesar la respuesta:", error);
          $("#resultado").html(
            "<div class='alert alert-danger'>Error inesperado. Consulte la consola para más detalles.</div>"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error en la solicitud AJAX:", textStatus, errorThrown);
        $("#resultado").html(
          "<div class='alert alert-danger'>Error en la comunicación con el servidor.</div>"
        );
      },
      complete: function () {
        console.log("Conexión con el servidor finalizada.");
      },
    });
  });
});
