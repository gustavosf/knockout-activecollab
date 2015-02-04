<?php

$api_info = (include 'credentials.php');

$data = $_GET;
$data['auth_api_token'] = $api_info['token'];
$data['path_info'] = trim($_SERVER['PATH_INFO'], '/');
$data['format'] = 'json';

$url = $api_info['host'].'?'.http_build_query($data);
echo file_get_contents($url);