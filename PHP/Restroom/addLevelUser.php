<?php
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen

header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS
// Configuración de la API
include 'configInbio.php';

// Obtener datos del request en formato JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verificar si el pin está presente
if (!isset($input['pin'])) {
    echo json_encode(["error" => "Pin no proporcionado"]);
    exit;
}

$userPin = $input['pin']; // Obtener el PIN del usuario
$accessLevelIds = "2c9a86e09499c21c0194e17a34332972"; // ID del nivel de acceso

// Construir la URL del endpoint
$apiUrl = "http://$serverIP:$serverPort/api/accLevel/addLevelPerson?levelIds=$accessLevelIds&pin=$userPin&access_token=$apiToken";

// Inicializar cURL
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json"
    ]
]);

// Ejecutar la solicitud
$response = curl_exec($curl);

// Manejar errores
if (curl_errno($curl)) {
    echo json_encode(["error" => "Error en la solicitud: " . curl_error($curl)]);
    curl_close($curl);
    exit;
}

// Cerrar cURL
curl_close($curl);

// Procesar la respuesta
$data = json_decode($response, true);

if ($data && isset($data['code']) && $data['code'] === 0) {
    echo json_encode(["success" => "Nivel(es) de acceso asignado(s) exitosamente: nivel $accessLevelIds"]);
} else {
    echo json_encode(["error" => "Error al asignar el nivel de acceso: " . ($data['message'] ?? "Respuesta inválida")]);
}
?>
