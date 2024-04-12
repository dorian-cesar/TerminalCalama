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
        $id = $data;

        // SQL Seguro
        $stmt = $conn->prepare("SELECT posicion, rut, hora, fecha, talla, tipo FROM custodias WHERE idcustodia = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()){
            $result = $stmt->get_result();
            $registro = $result->fetch_assoc();

            if(strcmp($registro['tipo'],'Entregado')==0){
                echo "Error: este ticket ya ha sido escaneado anteriormente";
                return;
            }
            header('Content-Type: application/json');
            echo json_encode($registro);
        } else {
            echo "Error al obtener datos: " + $conn->error;
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
