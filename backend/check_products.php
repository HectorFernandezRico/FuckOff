<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CATEGORIES ===\n";
foreach(App\Models\Category::all() as $cat) {
    echo "ID: {$cat->id} | Name: {$cat->name} | Slug: {$cat->slug}\n";
}

echo "\n=== PRODUCTS ===\n";
foreach(App\Models\Product::with('category')->get() as $p) {
    $catName = $p->category ? $p->category->name : 'None';
    $catSlug = $p->category ? $p->category->slug : 'None';
    echo "ID: {$p->id} | {$p->name} | Category ID: {$p->category_id} | Category: {$catName} (slug: {$catSlug})\n";
}
