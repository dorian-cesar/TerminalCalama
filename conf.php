<?php
//To-Do: Transformar a objeto
//Nota: No subir a git
$server = "localhost";
$user = "root";
$pass = "";
$db = "masgps";

$conn = new mysqli($server,$user,$pass,$db);

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}
?>