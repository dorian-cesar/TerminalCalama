<?php 
include_once("./conf.php");
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Permitir solicitudes POST y OPTIONS

$stmt = "SELECT id, posicion, rut, hora, fecha, tamano, tipo FROM custodias ORDER BY id desc limit 10";
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