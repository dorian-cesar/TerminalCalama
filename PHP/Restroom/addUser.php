<?php
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen

header("Access-Control-Allow-Methods: POST , OPTIONS"); // Permitir solicitudes POST y OPTIONS
// Configuración de la API
include "configInbio.php";

// Obtener datos del request en formato JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verificar si los datos existen
if (!isset($input['pin']) || !isset($input['idNo'])) {
    echo json_encode(["error" => "Datos inválidos"]);
    exit;
}

$pin = $input['pin'];
$pin =substr($pin, 0, 6);
$idNo = $input['idNo'];

// Endpoint de la API
$apiUrl = "http://$serverIP:$serverPort/api/person/add?access_token=$apiToken";

// Datos del usuario a agregar
$userData = [
    "pin" => $pin,                 // Usamos el código generado
    "name" => "autogenerado",       // Nombre genérico
    "password" => "",               // Sin contraseña
    "cardNo" => $idNo,                 // Sin tarjeta
    "deptCode" => "1",              // Departamento por defecto
    "gender" => "M",                // Género por defecto
    "idNo" => "",                // Mismo código generado
    "email" => ""                   // Sin email
];

// Inicializar cURL
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode($userData), // Enviar JSON
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"]
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
    echo json_encode(["success" => "Usuario agregado exitosamente"]);
} else {
    echo json_encode(["error" => "Error al agregar el usuario: " . ($data['message'] ?? "Respuesta inválida")]);
}
?>
