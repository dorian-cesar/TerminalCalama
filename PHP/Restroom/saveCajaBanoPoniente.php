<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header('Access-Control-Max-Age: 86400');
    header("HTTP/1.1 200 OK");
    exit;
}

include(dirname(__DIR__)."/confBanostsur.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data !== null) {
        // Mapeo de campos desde el JSON (con valores por defecto o null)
        $id_aperturas_cierres = isset($data["id_aperturas_cierres"]) ? $data["id_aperturas_cierres"] : null;
        $id_usuario          = isset($data["id_usuario"]) ? $data["id_usuario"] : null;
        $id_servicio         = isset($data["id_servicio"]) ? $data["id_servicio"] : null;
        $numero_caja         = isset($data["numero_caja"]) ? $data["numero_caja"] : null;
        $monto               = isset($data["monto"]) ? $data["monto"] : null;
        $medio_pago          = isset($data["medio_pago"]) ? $data["medio_pago"] : null; // 'EFECTIVO' o 'TARJETA'
        $fecha               = isset($data["fecha"]) ? $data["fecha"] : date("Y-m-d");
        $hora                = isset($data["hora"]) ? $data["hora"] : date("H:i:s");
        $codigo              = isset($data["codigo"]) ? $data["codigo"] : null;
        $boleta              = isset($data["boleta"]) ? $data["boleta"] : null;

        // Validar campos obligatorios según la definición de tu tabla
        if ($id_servicio === null || $numero_caja === null || $monto === null || $medio_pago === null) {
            http_response_code(400);
            echo json_encode(["error" => "Los campos id_servicio, numero_caja, monto y medio_pago son requeridos"]);
            exit;
        }

        // Preparar la consulta para la tabla 'movimientos'
        $stmt = $conn->prepare("
            INSERT INTO movimientos (id_aperturas_cierres, id_usuario, id_servicio, numero_caja, monto, medio_pago, fecha, hora, codigo, boleta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        // Tipos: i = int, d = double/decimal, s = string
        // El monto se trata como 'd' (double) por ser decimal en la DB
        $stmt->bind_param("iiiidsssss", 
            $id_aperturas_cierres, 
            $id_usuario, 
            $id_servicio, 
            $numero_caja, 
            $monto, 
            $medio_pago, 
            $fecha, 
            $hora, 
            $codigo, 
            $boleta
        );

        if ($stmt->execute()) {
            header('Content-Type: application/json');
            echo json_encode(["success" => "Movimiento registrado correctamente", "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al insertar movimiento: " . $conn->error]);
        }

        $stmt->close();
        $conn->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Error al decodificar el JSON"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
