<?php 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

include(dirname(__DIR__)."/conf.php"); 

$stmt = "SELECT idcustodia, posicion, rut, hora, fecha, talla, tipo, valor, horasal, fechasal FROM custodias ORDER BY idcustodia desc limit 12";
$result = $conn->query($stmt);

// Verificar si hay resultados
if ($result->num_rows > 0) {
    // Crear un array para almacenar los resultados
    $datos = array();

    // Recorrer los resultados y agregarlos al array
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
    }

    // Enviar la respuesta como JSON
    header('Content-Type: application/json');
    echo json_encode($datos);
} else {
    // Si no hay resultados
    echo "No se encontraron datos.";
}

// Cerrar la conexión a la base de datos
$conn->close();



?>