<?php
require 'vendor/autoload.php';
echo class_exists('Eris\Generators') ? "Generators: found\n" : "Generators: not found\n";
echo trait_exists('Eris\TestTrait') ? "TestTrait: found\n" : "TestTrait: not found\n";
$g = new \Eris\Generators();
echo "Generators instantiated\n";
