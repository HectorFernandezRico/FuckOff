<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== USERS ===\n";
foreach(App\Models\User::all() as $user) {
    $passwordHash = substr($user->password, 0, 30) . '...';
    echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email} | Role: {$user->role}\n";
    echo "  Password Hash: {$passwordHash}\n";
    echo "  Created: {$user->created_at}\n\n";
}

echo "Total usuarios: " . App\Models\User::count() . "\n";
