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

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $estado = $data["estado"];
        $fecha = $data["fecha"];
        $hora = $data["hora"];

        // SQL Seguro
        //$stmt = $conn->prepare("INSERT INTO custodiaestado (estado, hora, fecha) VALUES (?,?,?)");
        $stmt = $conn->prepare("UPDATE custodiaestado SET estado = ?, hora = ?, fecha = ? WHERE idestado = 1");
        $stmt->bind_param("sss", $estado, $hora, $fecha);

        if ($stmt->execute()){
            $id = 1;
            header('Content-Type: application/json');
            echo json_encode($id);
        } else {
            echo "Error al insertar datos: " + $conn->error;
        }

        $conn->close();
    } else {
        http_response_code(400);
        echo "Error al decodificar JSON";
    }
} else {
    http_response_code(405);
    echo "Solicitud no permitida";
}
?>
