<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'active',
        'path',
        'image_secondary',
        'size',
        'stock',
    ];

    public function category() { return $this->belongsTo(Category::class); }

    public function sizes() { return $this->hasMany(ProductSize::class); }
}
