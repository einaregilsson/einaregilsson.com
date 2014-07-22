<?php
$_SERVER['REQUEST_URI'] = substr($_SERVER['QUERY_STRING'], strpos($_SERVER['QUERY_STRING'], ':80')+3);
$_SERVER['PATH_INFO'] = $_SERVER['REQUEST_URI'];
include('index.php');
?>