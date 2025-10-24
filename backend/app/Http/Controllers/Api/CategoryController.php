<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    // Listar todas las categorías
    public function index()
    {
        // Recupera todas las categorías (si tienes paginación preferida, cámbialo)
        $categories = Category::all();

        // Devuelve JSON con código 200 OK
        return response()->json(['data' => $categories], Response::HTTP_OK);
    }

    // Mostrar una categoría concreta (route-model binding)
    public function show(Category $category)
    {
        // Devuelve la categoría encontrada
        return response()->json(['data' => $category], Response::HTTP_OK);
    }

    // Crear una nueva categoría
    public function store(Request $request)
    {
        // Validación básica — ajusta reglas a tus campos reales
        $data = $request->validate([
            'name' => 'required|string|max:255',
            // 'description' => 'nullable|string',
        ]);

        // Crear la categoría (asegúrate que $fillable en el modelo permite estos campos)
        $category = Category::create($data);

        // Responder con 201 Created y la nueva entidad
        return response()->json(['data' => $category], Response::HTTP_CREATED);
    }

    // Actualizar una categoría
    public function update(Request $request, Category $category)
    {
        // Validación básica — ajustar según esquema real
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // 'description' => 'nullable|string',
        ]);

        // Actualiza los campos permitidos
        $category->update($data);

        // Devuelve la entidad actualizada
        return response()->json(['data' => $category], Response::HTTP_OK);
    }

    // Eliminar una categoría
    public function destroy(Category $category)
    {
        // Borrar registro (si tienes relaciones, revisa CASCADE o impedir borrado)
        $category->delete();

        // Devuelve 204 No Content para indicar éxito sin cuerpo
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}