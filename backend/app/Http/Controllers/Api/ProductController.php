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
        // Incluir tallas con stock en la respuesta
        $products = Product::with('sizes')->get();
        return response()->json(['data' => $products], Response::HTTP_OK);
    }

    // Mostrar un producto
    public function show($id)
    {
        $product = Product::with('sizes')->findOrFail($id);
        return response()->json(['data' => $product], Response::HTTP_OK);
    }

    // Crear producto
    public function store(Request $request)
    {
        // Parsear sizes si viene como JSON string
        if ($request->has('sizes') && is_string($request->input('sizes'))) {
            $request->merge(['sizes' => json_decode($request->input('sizes'), true)]);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'size' => 'nullable|string|max:10',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'image_secondary' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'active' => 'nullable|boolean',
            'sizes' => 'nullable|array', // Stock por talla
            'sizes.*.size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'sizes.*.stock' => 'required|integer|min:0',
        ]);

        // Asignar talla por defecto si no se proporciona
        if (!isset($data['size']) || empty($data['size'])) {
            $data['size'] = 'M';
        }

        // Manejar imagen principal si se subió
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('products', $filename, 'public');
            $data['path'] = '/storage/' . $path;
        } else {
            $data['path'] = '/images/products/default.jpg';
        }

        // Manejar imagen secundaria si se subió
        if ($request->hasFile('image_secondary')) {
            $imageSecondary = $request->file('image_secondary');
            $filenameSecondary = time() . '_' . uniqid() . '_secondary.' . $imageSecondary->getClientOriginalExtension();
            $pathSecondary = $imageSecondary->storeAs('products', $filenameSecondary, 'public');
            $data['image_secondary'] = '/storage/' . $pathSecondary;
        }

        // Asegurar que active sea booleano
        $data['active'] = isset($data['active']) ? (bool)$data['active'] : true;

        // Guardar sizes para después
        $sizesData = $data['sizes'] ?? null;
        unset($data['sizes']);

        $product = Product::create($data);

        // Crear registros de stock por talla
        if ($sizesData && is_array($sizesData)) {
            foreach ($sizesData as $sizeData) {
                $product->sizes()->create([
                    'size' => $sizeData['size'],
                    'stock' => $sizeData['stock'],
                ]);
            }
        }

        // Cargar las tallas para la respuesta
        $product->load('sizes');

        return response()->json(['data' => $product], Response::HTTP_CREATED);
    }

    // Actualizar producto
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Parsear sizes si viene como JSON string
        if ($request->has('sizes') && is_string($request->input('sizes'))) {
            $request->merge(['sizes' => json_decode($request->input('sizes'), true)]);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:products,slug,' . $id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'size' => 'nullable|string|max:10',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'image_secondary' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'active' => 'nullable|boolean',
            'sizes' => 'nullable|array', // Stock por talla
            'sizes.*.size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'sizes.*.stock' => 'required|integer|min:0',
        ]);

        // Asignar talla por defecto si no se proporciona en la actualización
        if (isset($data['size']) && empty($data['size'])) {
            $data['size'] = 'M';
        }

        // Manejar imagen principal si se subió una nueva
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

        // Manejar imagen secundaria si se subió una nueva
        if ($request->hasFile('image_secondary')) {
            // Eliminar imagen secundaria anterior si existe
            if ($product->image_secondary) {
                $oldImageSecondaryPath = str_replace('/storage/', '', $product->image_secondary);
                \Storage::disk('public')->delete($oldImageSecondaryPath);
            }

            // Guardar nueva imagen secundaria
            $imageSecondary = $request->file('image_secondary');
            $filenameSecondary = time() . '_' . uniqid() . '_secondary.' . $imageSecondary->getClientOriginalExtension();
            $pathSecondary = $imageSecondary->storeAs('products', $filenameSecondary, 'public');
            $data['image_secondary'] = '/storage/' . $pathSecondary;
        }

        // Asegurar que active sea booleano si está presente
        if (isset($data['active'])) {
            $data['active'] = (bool)$data['active'];
        }

        // Guardar sizes para después
        $sizesData = $data['sizes'] ?? null;
        unset($data['sizes']);

        $product->update($data);

        // Actualizar stock por talla si se proporcionó
        if ($sizesData && is_array($sizesData)) {
            // Eliminar tallas existentes
            $product->sizes()->delete();

            // Crear nuevas tallas
            foreach ($sizesData as $sizeData) {
                $product->sizes()->create([
                    'size' => $sizeData['size'],
                    'stock' => $sizeData['stock'],
                ]);
            }
        }

        // Cargar las tallas para la respuesta
        $product->load('sizes');

        return response()->json(['data' => $product], Response::HTTP_OK);
    }

    // Eliminar producto
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Eliminar imagen principal si existe y no es la default
        if ($product->path && $product->path !== '/images/products/default.jpg') {
            $imagePath = str_replace('/storage/', '', $product->path);
            \Storage::disk('public')->delete($imagePath);
        }

        // Eliminar imagen secundaria si existe
        if ($product->image_secondary) {
            $imageSecondaryPath = str_replace('/storage/', '', $product->image_secondary);
            \Storage::disk('public')->delete($imageSecondaryPath);
        }

        $product->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}