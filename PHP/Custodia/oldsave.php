<?php
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

include(dirname(__DIR__)."/conf.php"); 

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $pos = $data["posicion"];
        $rut = $data["rut"];
        $hora = $data["hora"];
        $fecha = $data["fecha"];
        $tamano = $data["tamano"];
        $tipo = $data["tipo"];

        // SQL Seguro
        $stmt = $conn->prepare("INSERT INTO custodias (posicion, rut, hora, fecha, talla, tipo) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $pos,$rut,$hora,$fecha,$tamano,$tipo);

        if ($stmt->execute()){
            $id = $conn->insert_id;
            header('Content-Type: application/json');
            echo json_encode($id);
        } else {
            echo "Error al insertar datos: " + $conn->error;
        }

        $conn->close();
    } else {
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}
?>
