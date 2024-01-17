<?php
include_once("./conf.php");
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Verificar si se recibió una solicitud POST con datos en formato JSON
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener el cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodificar el JSON recibido
    $data = json_decode($json_data, true);

    // Verificar si el JSON se decodificó correctamente
    if ($data !== null) {
        // Acceder a los campos del JSON (en este ejemplo, se asume que los campos son "Codigo", "hora", "fecha" y "valor")
        $codigo = $data["Codigo"];
        $hora = $data["hora"];
        $fecha = $data["fecha"];
       // $valor = $data["valor"];

        // Prepared Statement
        $stmt = $conn->prepare("INSERT INTO ingresos (Codigo, hora, fecha) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $codigo,$hora,$fecha);

        if($stmt->execute()){
            echo "Datos insertados correctamente";
        } else {
            echo "Error al insertar datos: " + $conn->error;
        }

        // Cerrar la conexión a la base de datos
        $conn->close();
    } else {
        // Si hubo un error al decodificar el JSON
        http_response_code(400); // Error de solicitud incorrecta
        echo "Error al decodificar el JSON";
    }
} else {
    // Si no se recibió una solicitud POST
    http_response_code(405); // Método no permitido
    echo "Solicitud no permitida";
}
?>
