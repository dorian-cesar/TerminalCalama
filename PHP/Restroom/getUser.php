<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "configInbio.php";

// Obtener PIN del body
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['pin'])) {
    echo json_encode(["error" => "El campo 'pin' es obligatorio"]);
    exit;
}

$pin = $input['pin'];

// --- Nueva estructura de URL según tu ejemplo ---
// El PIN se concatena al final de la ruta
$apiUrl = "http://$serverIP:$serverPort/api/card/getCards/$pin?access_token=$apiToken";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

$data = json_decode($response, true);

echo json_encode($data);
?>

