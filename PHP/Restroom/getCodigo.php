<?php
// Encabezados
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// Incluir la configuración de conexión
include(dirname(__DIR__) . "/conf.php");

// Verificar que el método sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

// Verificar si el parámetro 'codigo' está presente
if (!isset($_GET['codigo']) || empty($_GET['codigo'])) {
    http_response_code(400);
    echo json_encode(["error" => "Parámetro 'codigo' es requerido"]);
    exit;
}

$codigo = $conn->real_escape_string($_GET['codigo']);

try {
    $sql = "SELECT idrestroom, Codigo, date, time, tipo FROM restroom WHERE Codigo = '$codigo'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $datos = [];

        while ($row = $result->fetch_assoc()) {
            $datos[] = $row;
        }

        echo json_encode($datos);
    } else {
        echo json_encode(["message" => "No se encontraron datos para el código proporcionado."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar la base de datos", "detalle" => $e->getMessage()]);
}

// Cerrar la conexión
$conn->close();
?>
