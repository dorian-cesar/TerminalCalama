<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header('Access-Control-Max-Age: 86400');
    header("HTTP/1.1 200 OK");
    exit;
}

include(dirname(__DIR__)."/conf.php");

// Verificar si se recibió una solicitud POST con datos JSON
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data !== null) {
        // Obtener los campos desde el JSON
        $codigo = $data["Codigo"];
        $hora = $data["hora"];
        $fecha = $data["fecha"];
        $tipo = $data["tipo"];
        $valor = $data["valor"];
        $id_caja = isset($data["id_caja"]) ? $data["id_caja"] : null;
        $medio_pago = isset($data["medio_pago"]) ? $data["medio_pago"] : null;

        // Validar campos obligatorios
        if ($id_caja === null) {
            http_response_code(400);
            echo json_encode(["error" => "El campo id_caja es requerido"]);
            exit;
        }
        if ($medio_pago === null) {
            http_response_code(400);
            echo json_encode(["error" => "El campo medio_pago es requerido"]);
            exit;
        }

        // Insertar con medio_pago
        $stmt = $conn->prepare("
            INSERT INTO restroom (Codigo, time, date, tipo, valor, id_caja, medio_pago)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssssiss", $codigo, $hora, $fecha, $tipo, $valor, $id_caja, $medio_pago);

        if ($stmt->execute()) {
            header('Content-Type: application/json');
            echo json_encode(["success" => "Datos insertados correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al insertar datos: " . $conn->error]);
        }

        $stmt->close();
        $conn->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Error al decodificar el JSON"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Solicitud no permitida"]);
}
?>