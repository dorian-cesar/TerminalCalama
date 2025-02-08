<?php 
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen

header("Access-Control-Allow-Methods: GET, OPTIONS"); // Permitir solicitudes POST y OPTIONS



include(dirname(__DIR__)."/conf.php"); 


 $sql = "SELECT idrestroom, Codigo, date, time, tipo FROM restroom order by idrestroom desc limit 28";
$result = $conn->query($sql);

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