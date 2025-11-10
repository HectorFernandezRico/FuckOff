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
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'size' => 'required|string|max:10',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'active' => 'nullable|boolean',
        ]);

        // Manejar imagen si se subió
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $data['path'] = '/storage/' . $path;
        } else {
            $data['path'] = '/images/products/default.jpg';
        }

        // Asegurar que active sea booleano
        $data['active'] = isset($data['active']) ? (bool)$data['active'] : true;

        $product = Product::create($data);

        return response()->json(['data' => $product], Response::HTTP_CREATED);
    }

    // Actualizar producto
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:products,slug,' . $id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'size' => 'sometimes|required|string|max:10',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'active' => 'nullable|boolean',
        ]);

        // Manejar imagen si se subió una nueva
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe y no es la default
            if ($product->path && $product->path !== '/images/products/default.jpg') {
                $oldImagePath = str_replace('/storage/', '', $product->path);
                \Storage::disk('public')->delete($oldImagePath);
            }

            // Guardar nueva imagen
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $data['path'] = '/storage/' . $path;
        }

        // Asegurar que active sea booleano si está presente
        if (isset($data['active'])) {
            $data['active'] = (bool)$data['active'];
        }

        $product->update($data);

        return response()->json(['data' => $product], Response::HTTP_OK);
    }

    // Eliminar producto
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Eliminar imagen si existe y no es la default
        if ($product->path && $product->path !== '/images/products/default.jpg') {
            $imagePath = str_replace('/storage/', '', $product->path);
            \Storage::disk('public')->delete($imagePath);
        }

        $product->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}