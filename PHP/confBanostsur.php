<?php
//To-Do: Transformar a objeto
$server = "ls-dcdc6ebf8dd25287d874bc3c562bbfdb6c53af6c.cylsiewx0zgx.us-east-1.rds.amazonaws.com";
$user = "dbmasteruser";
$pass = "kHuX85#J)J!%_K-|F%`I<%Flvp}YG7Y^";
$db = "terminales";

$conn = new mysqli($server,$user,$pass,$db);

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}
?>


