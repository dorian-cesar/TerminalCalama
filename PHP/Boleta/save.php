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

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];
        $estado = $data["estado"];
        $hora = $data["hora"];
        $fecha = $data["fecha"];
        $value = $data["valor"];
        $id_caja = isset($data["id_caja"]) ? $data["id_caja"] : null; 
        $medio_pago = isset($data["medio_pago"]) ? $data["medio_pago"] : null;

        // Validar campos requeridos
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

        // Actualizar la consulta para incluir medio_pago
        $stmt = $conn->prepare("
            UPDATE custodias 
            SET tipo = ?, horasal = ?, fechasal = ?, valor = ?, id_caja = ?, medio_pago = ? 
            WHERE idcustodia = ?
        ");
        $stmt->bind_param("sssissi", $estado, $hora, $fecha, $value, $id_caja, $medio_pago, $id);

        if ($stmt->execute()){
            header('Content-Type: application/json');
            echo json_encode(["success" => "Registro actualizado correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar datos: " . $conn->error]);
        }

        $stmt->close();
        $conn->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Error al decodificar JSON"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Solicitud no permitida"]);
}
?>