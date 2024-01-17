<?php
//To-Do: Transformar a objeto
$server = "ls-3c0c538286def4da7f8273aa5531e0b6eee0990c.cylsiewx0zgx.us-east-1.rds.amazonaws.com";
$user = "dbmasteruser";
$pass = "eF5D;6VzP$^7qDryBzDd,`+w(5e4*qI+";
$db = "masgps";

$conn = new mysqli($server,$user,$pass,$db);

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}
?>