<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FuckOffController;

// Authentication routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes (no authentication required for reading)
Route::get('category', [CategoryController::class, 'index']);
Route::get('category/{id}', [CategoryController::class, 'show']);
Route::get('product', [ProductController::class, 'index']);
Route::get('product/{id}', [ProductController::class, 'show']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    // Cart routes (available for all authenticated users)
    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart', [CartController::class, 'store']);
    Route::put('cart/{productId}', [CartController::class, 'update']);
    Route::delete('cart/{productId}', [CartController::class, 'destroy']);
    Route::delete('cart', [CartController::class, 'clear']);
    Route::post('cart/sync', [CartController::class, 'sync']);

    // Order routes (available for all authenticated users)
    Route::apiResource('order', OrderController::class);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Category management
    Route::post('category', [CategoryController::class, 'store']);
    Route::put('category/{id}', [CategoryController::class, 'update']);
    Route::delete('category/{id}', [CategoryController::class, 'destroy']);

    // Product management
    Route::post('product', [ProductController::class, 'store']);
    Route::put('product/{id}', [ProductController::class, 'update']);
    Route::delete('product/{id}', [ProductController::class, 'destroy']);

    // User management
    Route::apiResource('user', UserController::class);
});

// Serve images from storage (public route)
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!file_exists($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*');
