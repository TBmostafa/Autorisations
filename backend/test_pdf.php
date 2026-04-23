<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = app(\App\Http\Controllers\DemandeController::class);
    $request = \Illuminate\Http\Request::create('/api/demandes/6/pdf', 'GET');
    $response = $controller->exportPdf($request, 6);
    echo "SUCCESS\n";
} catch (\Exception $e) {
    echo $e->getMessage();
}
