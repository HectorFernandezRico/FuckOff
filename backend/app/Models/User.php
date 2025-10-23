<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    // Constantes para roles
    public const ROLE_ADMIN = 'admin';
    public const ROLE_USER = 'user';

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

     public function orders()
    {
        return $this->hasMany(Order::class);
    }

}
