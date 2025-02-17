<?php
//To-Do: Transformar a objeto
$server = "ls-ac361eb6981fc8da3000dad63b382c39e5f1f3cd.cylsiewx0zgx.us-east-1.rds.amazonaws.com";
$user = "dbmasteruser";
$pass = "CP7>2fobZp<7Kja!Efy3Q+~g:as2]rJD";
$db = "restroom";

$conn = new mysqli($server,$user,$pass,$db);

if($conn->connect_error){
    die("Error de conexion: " . $conn->connect_error);
}
?>


