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

        $cartItems = CartItem::with('product.sizes')
            ->where('user_id', $userId)
            ->get()
            ->map(function ($item) {
                // Buscar stock de la talla específica
                $sizeStock = $item->product->sizes->where('size', $item->size)->first();
                $availableStock = $sizeStock ? $sizeStock->stock : $item->product->stock;

                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'size' => $item->size,
                    'path' => $item->product->path,
                    'stock' => $availableStock,
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
            'size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'quantity' => 'required|integer|min:1',
        ]);

        // Verificar stock disponible de la talla específica
        $product = Product::with('sizes')->findOrFail($data['product_id']);
        $sizeStock = $product->sizes->where('size', $data['size'])->first();
        $availableStock = $sizeStock ? $sizeStock->stock : $product->stock;

        if ($availableStock < $data['quantity']) {
            return response()->json([
                'error' => "Stock insuficiente para la talla {$data['size']}",
                'available' => $availableStock
            ], Response::HTTP_BAD_REQUEST);
        }

        // Buscar si ya existe en el carrito (producto + talla)
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $data['product_id'])
            ->where('size', $data['size'])
            ->first();

        if ($cartItem) {
            // Actualizar cantidad
            $newQuantity = $cartItem->quantity + $data['quantity'];

            // Verificar stock para nueva cantidad
            if ($availableStock < $newQuantity) {
                return response()->json([
                    'error' => "Stock insuficiente para la talla {$data['size']}",
                    'available' => $availableStock,
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
                'size' => $data['size'],
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
            'size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('size', $data['size'])
            ->firstOrFail();

        // Verificar stock de la talla específica
        $product = Product::with('sizes')->findOrFail($productId);
        $sizeStock = $product->sizes->where('size', $data['size'])->first();
        $availableStock = $sizeStock ? $sizeStock->stock : $product->stock;

        if ($availableStock < $data['quantity']) {
            return response()->json([
                'error' => "Stock insuficiente para la talla {$data['size']}",
                'available' => $availableStock
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

        $data = $request->validate([
            'size' => 'required|string|in:XS,S,M,L,XL,XXL',
        ]);

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('size', $data['size'])
            ->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Producto eliminado del carrito'], Response::HTTP_OK);
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
            'items.*.size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Limpiar carrito actual
        CartItem::where('user_id', $userId)->delete();

        // Agregar items del localStorage
        foreach ($data['items'] as $item) {
            $product = Product::with('sizes')->find($item['id']);

            if ($product) {
                // Verificar stock de la talla específica
                $sizeStock = $product->sizes->where('size', $item['size'])->first();
                $availableStock = $sizeStock ? $sizeStock->stock : $product->stock;

                // Verificar stock y crear item
                if ($availableStock >= $item['quantity']) {
                    CartItem::create([
                        'user_id' => $userId,
                        'product_id' => $item['id'],
                        'size' => $item['size'],
                        'quantity' => min($item['quantity'], $availableStock), // Ajustar si excede stock
                    ]);
                }
            }
        }

        // Retornar carrito actualizado
        return $this->index($request);
    }
}
