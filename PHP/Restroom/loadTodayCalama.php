<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include(dirname(__DIR__) . "/conf.php");

// Manejo de preflight (CORS)
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

// Query con prepared statement
$stmt = $conn->prepare("
    SELECT
        COUNT(*) AS totalTransactions,
        SUM(CASE WHEN tipo = 'Baño' THEN 1 ELSE 0 END) AS totalBanos,
        SUM(CASE WHEN tipo = 'Ducha' THEN 1 ELSE 0 END) AS totalDuchas,
        SUM(valor) AS totalAmount
    FROM restroomCalama
    WHERE date = CURDATE()
    AND id_caja = ?
");

$stmt->bind_param("s", $id_caja);
$stmt->execute();

$result = $stmt->get_result();

// Respuesta base
$response = [
    "totalAmount" => 0,
    "totalTransactions" => 0,
    "totalBanos" => 0,
    "totalDuchas" => 0
];

if ($result && $row = $result->fetch_assoc()) {
    $response = [
        "totalAmount" => (float)$row['totalAmount'],
        "totalTransactions" => (int)$row['totalTransactions'],
        "totalBanos" => (int)$row['totalBanos'],
        "totalDuchas" => (int)$row['totalDuchas']
    ];
}

echo json_encode($response);

// Cerrar conexiones
$stmt->close();
$conn->close();