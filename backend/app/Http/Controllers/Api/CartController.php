<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Response;

class CartController extends Controller
{
    // Obtener carrito del usuario autenticado
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $cartItems = CartItem::with('product')
            ->where('user_id', $userId)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'size' => $item->product->size,
                    'path' => $item->product->path,
                    'stock' => $item->product->stock,
                    'quantity' => $item->quantity,
                ];
            });

        return response()->json(['data' => $cartItems], Response::HTTP_OK);
    }

    // Añadir producto al carrito
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // Verificar stock disponible
        $product = Product::findOrFail($data['product_id']);
        if ($product->stock < $data['quantity']) {
            return response()->json([
                'error' => 'Stock insuficiente',
                'available' => $product->stock
            ], Response::HTTP_BAD_REQUEST);
        }

        // Buscar si ya existe en el carrito
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($cartItem) {
            // Actualizar cantidad
            $newQuantity = $cartItem->quantity + $data['quantity'];

            // Verificar stock para nueva cantidad
            if ($product->stock < $newQuantity) {
                return response()->json([
                    'error' => 'Stock insuficiente',
                    'available' => $product->stock,
                    'current_in_cart' => $cartItem->quantity
                ], Response::HTTP_BAD_REQUEST);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Crear nuevo item
            $cartItem = CartItem::create([
                'user_id' => $userId,
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
            ]);
        }

        return response()->json(['data' => $cartItem], Response::HTTP_CREATED);
    }

    // Actualizar cantidad de un producto en el carrito
    public function update(Request $request, $productId)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->firstOrFail();

        // Verificar stock
        $product = Product::findOrFail($productId);
        if ($product->stock < $data['quantity']) {
            return response()->json([
                'error' => 'Stock insuficiente',
                'available' => $product->stock
            ], Response::HTTP_BAD_REQUEST);
        }

        $cartItem->quantity = $data['quantity'];
        $cartItem->save();

        return response()->json(['data' => $cartItem], Response::HTTP_OK);
    }

    // Eliminar producto del carrito
    public function destroy(Request $request, $productId)
    {
        $userId = $request->user()->id;

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    // Vaciar carrito completo
    public function clear(Request $request)
    {
        $userId = $request->user()->id;

        CartItem::where('user_id', $userId)->delete();

        return response()->json(['message' => 'Carrito vaciado'], Response::HTTP_OK);
    }

    // Sincronizar carrito desde localStorage
    public function sync(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Limpiar carrito actual
        CartItem::where('user_id', $userId)->delete();

        // Agregar items del localStorage
        foreach ($data['items'] as $item) {
            $product = Product::find($item['id']);

            // Verificar stock y crear item
            if ($product && $product->stock >= $item['quantity']) {
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $item['id'],
                    'quantity' => min($item['quantity'], $product->stock), // Ajustar si excede stock
                ]);
            }
        }

        // Retornar carrito actualizado
        return $this->index($request);
    }
}
