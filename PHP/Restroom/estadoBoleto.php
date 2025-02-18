<?php
// Configuración de la API
header("Content-Type: application/json"); // Respuesta en JSON
header("Access-Control-Allow-Origin: *"); // Permitir acceso desde cualquier origen
header("Access-Control-Allow-Methods: GET, POST"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type"); // Permitir JSON en el body

//include 'config.php'; // Archivo con las variables $serverIP y $serverPort
include 'configInbio.php';

// Obtener el userPin desde la URL (GET) o desde el body (POST)
$userPin = isset($_GET['userPin']) ? $_GET['userPin'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (isset($input['userPin'])) {
        $userPin = $input['userPin'];
    }
}

// Validar si se recibió el PIN
if (!$userPin) {
    echo json_encode(["error" => "Falta el parámetro 'userPin'"], JSON_PRETTY_PRINT);
    exit;
}

// Construir la URL de la API
$apiUrl = "http://$serverIP:$serverPort/api/transaction/person/$userPin?access_token=$apiToken&pageNo=1&pageSize=10";

// Configurar cURL
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 5, // Reducimos timeout para evitar bloqueos largos
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
));

$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE); // Obtener código de respuesta HTTP
curl_close($curl);

// Manejar errores de cURL o API
if ($http_code !== 200 || !$response) {
    echo json_encode(["error" => "No se pudo conectar con la API o hubo un error en la solicitud."], JSON_PRETTY_PRINT);
    exit;
}

// Decodificar el JSON recibido
$data = json_decode($response, true);

// Verificar si la respuesta contiene datos válidos
if (!isset($data['data']) || !is_array($data['data']) || count($data['data']) === 0) {
    echo json_encode(["message" => "Boleto sin usar."], JSON_PRETTY_PRINT);
    exit;
}

// Buscar si hay un evento con "Verificación en segundo plano exitosa"
foreach ($data['data'] as $event) {
    if (isset($event['eventName']) && $event['eventName'] === "Verificación en segundo plano exitosa") {
        echo json_encode([
            "message" => "El boleto ha sido ocupado.",
            "eventTime" => $event['eventTime'],
            "doorName" => $event['doorName']
        ], JSON_PRETTY_PRINT);
        exit;
    }
}

// Si no se encontró el evento, el boleto sigue válido
echo json_encode(["message" => "El boleto es válido y no ha sido ocupado."], JSON_PRETTY_PRINT);
?>
