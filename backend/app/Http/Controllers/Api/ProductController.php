<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    // Listar productos
    public function index()
    {
        // Puedes añadir with('category') si el modelo tiene relación definida
        $products = Product::all();
        return response()->json(['data' => $products], Response::HTTP_OK);
    }

    // Mostrar un producto
    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json(['data' => $product], Response::HTTP_OK);
    }

    // Crear producto
    public function store(Request $request)
    {
        // Validación básica: adapta los campos reales (precio, stock, category_id, etc.)
        $data = $request->validate([
            'name' => 'required|string|max:255',
            // 'description' => 'nullable|string',
            // 'price' => 'required|numeric',
            // 'category_id' => 'nullable|exists:categories,id',
        ]);

        $product = Product::create($data);

        return response()->json(['data' => $product], Response::HTTP_CREATED);
    }

    // Actualizar producto
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // 'price' => 'sometimes|required|numeric',
            // 'stock' => 'sometimes|integer',
        ]);

        $product->update($data);

        return response()->json(['data' => $product], Response::HTTP_OK);
    }

    // Eliminar producto
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}