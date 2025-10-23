<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'total_price',
        'shipping_address',
        'billing_address',
    ];

     public function user()
    {
        return $this->belongsTo(User::class);
    }
}
