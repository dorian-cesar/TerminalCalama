<?php 

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen

header("Access-Control-Allow-Methods: GET, OPTIONS"); // Permitir solicitudes POST y OPTIONS

 // Crear conexión a la base de datos (reemplaza con tus credenciales)
 $servername = "localhost";
 $username = "root";
 $password = "";
 $dbname = "restroom";

 // Crear conexión
 $conn = new mysqli($servername, $username, $password, $dbname);

 // Verificar la conexión
 if ($conn->connect_error) {
     die("Error de conexión: " . $conn->connect_error);
 }

 $sql = "SELECT id, Codigo, Fecha, Hora FROM ingresos order by id desc limit 20";
$result = $conn->query($sql);

// Verificar si hay resultados
if ($result->num_rows > 0) {
    // Crear un array para almacenar los resultados
    $datos = array();

    // Recorrer los resultados y agregarlos al array
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
    }

    // Enviar la respuesta como JSON
    header('Content-Type: application/json');
    echo json_encode($datos);
} else {
    // Si no hay resultados
    echo "No se encontraron datos.";
}

// Cerrar la conexión a la base de datos
$conn->close();



?>