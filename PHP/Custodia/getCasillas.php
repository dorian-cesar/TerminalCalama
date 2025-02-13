<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: application/json'); // Asegurarse de establecer el Content-Type antes de la salida

include(dirname(__DIR__)."/conf.php"); 

$stmt = "SELECT estado FROM custodiaestado";
$result = $conn->query($stmt);

if ($result->num_rows > 0) {
    // Crear un array simple para almacenar solo los estados
    $datos = array();
    
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row['estado']; // Agregar solo el valor de la columna 'estado'
    }

    echo json_encode($datos); // Devolver el array simple como JSON
} else {
    echo json_encode([]); // Devolver un array vacío si no hay resultados
}

$conn->close();
?>
