<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit;
}

include(dirname(__DIR__) . "/conf.php");
header('Content-Type: application/json; charset=utf-8');

// Validar parámetro "rut"
if (!isset($_GET['rut']) || empty(trim($_GET['rut']))) {
    echo json_encode(["success" => false, "error" => "Debe proporcionar un RUT para buscar."]);
    exit;
}

$rut = trim($_GET['rut']);

// Consulta exacta (usa índice si existe)
$stmt = $conn->prepare("
    SELECT idcustodia, posicion, rut, hora, fecha, talla, tipo, valor, horasal, fechasal
    FROM custodias
    WHERE rut = ?
    ORDER BY idcustodia DESC
");

$stmt->bind_param("s", $rut);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $datos = [];
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
    }
    echo json_encode(["success" => true, "data" => $datos], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["success" => false, "message" => "No se encontraron registros para el RUT especificado."]);
}

$stmt->close();
$conn->close();
?>