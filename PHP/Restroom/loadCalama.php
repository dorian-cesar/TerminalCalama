<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include(dirname(__DIR__)."/conf.php");

// Manejo preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Leer body JSON
$input = json_decode(file_get_contents("php://input"), true);

// Validar id_caja
if (!isset($input['id_caja']) || empty($input['id_caja'])) {
    echo json_encode([
        "error" => "Falta el parámetro id_caja"
    ]);
    exit;
}

$id_caja = $input['id_caja'];

// Prepared statement
$stmt = $conn->prepare("
    SELECT 
        idrestroom, 
        Codigo, 
        date, 
        time, 
        tipo 
    FROM restroomCalama
    WHERE id_caja = ?
    ORDER BY idrestroom DESC
    LIMIT 28
");

// Ajusta tipo si es necesario ("i" si es número)
$stmt->bind_param("s", $id_caja);

$stmt->execute();
$result = $stmt->get_result();

// Respuesta
$datos = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
    }
}

// Siempre devolver JSON consistente
echo json_encode($datos);

// Cerrar conexiones
$stmt->close();
$conn->close();
?>